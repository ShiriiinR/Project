const API_KEY = '8V9eaLtjgYzAh0fCzHLyNkxRSasuYb2BkAslg70H0r4';
const BASE_URL = 'https://api.unsplash.com/';

let page = 1;
const perPage = 30;
let loading = false;
let selectedOrientation = 'all'
const randomImg = 'photos/random';
const loadingIcon = document.getElementById('loadingIcon');

async function fetchDataRandomImg(apiKey, url, page, orientation, getImg){
    try{
        showLoadingIcon()

        loading = true;
        const link = new URL(url + getImg);
        link.searchParams.set('client_id', apiKey);
        link.searchParams.set('count', '30');
        link.searchParams.set('page', page);

        if(orientation !== 'all'){
            link.searchParams.set('orientation', orientation)
        }

        const response = await fetch(link);
        const data = await response.json()
        
        return data;
    }catch(error){
        console.error('We do not find something', error);
        throw error;
    }finally{
        hideLoadingIcon();

        loading = false;
    }
}

async function getAndRenderImage(){
    try{
        const data = await fetchDataRandomImg(API_KEY, BASE_URL, page, selectedOrientation, randomImg);

        render(data)

        document.addEventListener('load', async () => {
            showLoadingIcon();
            await getAndRenderImage()
            hideLoadingIcon()
        })

        window.addEventListener('scroll', async () => {
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;
            const scrollTop = window.scrollY;
            const bottomOffset = 200;
        
            if (scrollTop + clientHeight >= scrollHeight - bottomOffset && !loading) {
                loading = true;
                showLoadingIcon();
                await getAndRenderImage()
                hideLoadingIcon()
            }
        })
    }catch(error){
        console.error('somthing went wrong', error);
        throw error;
    }
}

getAndRenderImage()

const orientationSelectElem = document.getElementById('selectOrientation');
let previosOrientation = selectedOrientation;
orientationSelectElem.addEventListener('change', e => {
    e.preventDefault()
    selectedOrientation = e.target.value;
    
    clearPage()
    getAndRenderImage()
    previosOrientation = selectedOrientation;

})


async function clearPage(){
    const container = document.getElementById('randomPhotoContainer');
    container.innerHTML = '';
}

const searchImg = '/search/photos'

function searchImages() {
    const searchForm = document.forms.searchForm;
    const searchInput = searchForm.searchPhotoInput;

    searchForm.addEventListener('submit', e => {
        e.preventDefault();

        const searchQuery = searchInput.value;

        if (searchQuery) {
            handleSearchQuery(searchQuery);
        }

        if(favoritesPhotoContainer.style.display = 'grid'){
            favoritesPhotoContainer.style.display = 'none';
            containerOfPhoto.style.display = 'grid'
        }
    })

}

async function handleSearchQuery(query) {
    try {
        showLoadingIcon();
        clearPage();

        const data = await fetchDataSearchImg(API_KEY, BASE_URL, page, selectedOrientation, searchImg, query);

        if (data.results && data.results.length > 0) {
            renderSearchResults(data.results);
        } else {
            console.log('No results found.');
        }

        return data;
    } catch (error) {
        console.error('Error handling search query:', error);
        throw error;
    } finally {
        hideLoadingIcon();
    }
}

function render(data){
    const randomPhotoContainer = document.getElementById('randomPhotoContainer');
    data.forEach(photo => {
        const imageDiv = document.createElement('div');
        imageDiv.classList.add('image-elem');

        const img = document.createElement('img');
        img.classList.add('img-item');
        img.src = photo.urls.regular;
        img.alt = photo.alt_description;

        img.setAttribute('data-photo', JSON.stringify(photo));

        imageDiv.appendChild(img);
        randomPhotoContainer.appendChild(imageDiv);

        page++;
    })



}

async function renderSearchResults(results) {
    render(results)

    document.addEventListener('load', async () => {
        showLoadingIcon();
        await renderSearchResults()
        hideLoadingIcon()
    })

    window.addEventListener('scroll', async () => {
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = window.innerHeight;
        const scrollTop = window.scrollY;
        const bottomOffset = 200;
    
        if (scrollTop + clientHeight >= scrollHeight - bottomOffset && !loading) {
            loading = true;
            showLoadingIcon();
            await renderSearchResults()
            hideLoadingIcon()
        }
    });
}

searchImages();

async function fetchDataSearchImg(apiKey, url, page, orientation, getImg, typeOfImg){
    try{
        showLoadingIcon()

        loading = true;
        const link = new URL(url + getImg);
        link.searchParams.set('client_id', apiKey);
        link.searchParams.set('page', page);
        link.searchParams.set('query', typeOfImg);
        link.searchParams.set('per_page', '30');

        if(orientation !== 'all'){
            link.searchParams.set('orientation', orientation)
        }

        const response = await fetch(link);
        const data = await response.json()
        // console.log(data);
        
        return data;
    }catch(error){
        console.error('We do not find something', error);
        throw error;
    }finally{
        hideLoadingIcon();

        loading = false;
    }
}    

function showLoadingIcon() {
    loadingIcon.style.display = 'flex';
}

function hideLoadingIcon() {
    loadingIcon.style.display = 'none'; 
}


const modal = document.getElementById('myModal');
const modalImage = document.getElementById('modalImage');
const closeModalBtn = document.getElementById('closeModal');

function openModal(photo) {
    modal.style.display = 'flex';
    modalImage.src = photo.urls.regular;

    const topPosition = window.scrollY;
    const leftPosition = window.scrollX;

    modal.style.top = `${topPosition}px`;
    modal.style.left = `${leftPosition}px`;

    document.body.style = 'overflow: hidden'
}

const containerOfPhoto = document.getElementById('randomPhotoContainer');
const favoriteBtn = document.getElementById('favoriteBtn');

function getPhotoByAttribute(container){
    container.addEventListener('click', e => {
        const photoData = e.target.getAttribute('data-photo');

        if (photoData) {
            const parsedData = JSON.parse(photoData);
            openModal(parsedData)
            favoriteBtn.addEventListener('click', () => {
                saveToLocalStorage(parsedData, true);
                
            })
        }
    })
}

getPhotoByAttribute(containerOfPhoto);


function closeModal(){

    document.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
            document.body.style = 'overflow: auto'
        }
    });
    
    closeModalBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
}

closeModal()

const commentsList = document.getElementById('commentsList');
const addCommentsFormElem = document.forms.commentForm;
const addNameInputElem = addCommentsFormElem.name;
const textareaElem = addCommentsFormElem.comment;

function addComments(e){
    e.preventDefault()

    const inputVal = addNameInputElem.value;
    const textareaVal = textareaElem.value;

    const divContainerCommentBlock = document.createElement('div');
    divContainerCommentBlock.classList.add('container-comment-block');

    const divCommentBlock = document.createElement('div');
    divCommentBlock.classList.add('comment-block-elem');

    const divNameBlock = document.createElement('div');
    divNameBlock.classList.add('use-name-elem')

    divNameBlock.textContent = inputVal;
    divCommentBlock.textContent = textareaVal;
    
    divContainerCommentBlock.append(divNameBlock, divCommentBlock);
    commentsList.appendChild(divContainerCommentBlock)
}

addCommentsFormElem.addEventListener('submit', addComments)

const favoritesPhotoElem = document.getElementById('headerFavorites');
const favoritesPhotoContainer = document.getElementById('favoritesPhotoContainer');

function showFavorites(){
    containerOfPhoto.style.display = 'none';
    favoritesPhotoContainer.style.display = 'grid';

    renderSavedPhotos()
}

favoritesPhotoElem.addEventListener('click', showFavorites);

let favPhotoArr = JSON.parse(localStorage.getItem('favorite')) || [];

const likeBtn = document.getElementById('likeBtn');
const unlikeBtn = document.getElementById('unlikeBtn');

function clickOnLike(){
    if(likeBtn.id === 'likeBtn'){
        likeBtn.style.display = 'none';
        unlikeBtn.style.display = 'block'
    }
}

function deleteLike(){
    if(unlikeBtn.id === 'unlikeBtn'){
        likeBtn.style.display = 'block';
        unlikeBtn.style.display = 'none';
    }
}

likeBtn.addEventListener('click', clickOnLike)
unlikeBtn.addEventListener('click', deleteLike)

function saveToLocalStorage(data, saveImage){
    let photoObj = {
        photo: data.id,
        url: data.urls.regular,
    }
    
    const existingFavorites = JSON.parse(localStorage.getItem('favorite')) || [];

    const isAlreadyInFavorites = existingFavorites.some(item => item.photo === photoObj.photo);

    if (saveImage && !isAlreadyInFavorites) {
        favPhotoArr.push(photoObj);
        localStorage.setItem('favorite', JSON.stringify(favPhotoArr));

        showNotification('Добавлено в избранное!');
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.classList.add('notification');
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        document.body.removeChild(notification);
    }, 3000);
}

function renderSavedPhotos() {
    
    favoritesPhotoContainer.innerHTML = ''; 

    const savedPhotos = JSON.parse(localStorage.getItem('favorite')) || [];

    savedPhotos.forEach(savedPhoto => {
        const imageDiv = document.createElement('div');
        imageDiv.classList.add('image-elem');

        const img = document.createElement('img');
        img.classList.add('img-item');
        img.src = savedPhoto.url; 
        img.alt = 'Saved Photo';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.classList.add('delete-btn');
        deleteBtn.textContent = 'Удалить';
        deleteBtn.addEventListener('click', () => {
            removeFromLocalStorage(savedPhoto.photo);
            removeFromFavorites();
        })

        imageDiv.appendChild(img);
        imageDiv.appendChild(deleteBtn);
        favoritesPhotoContainer.appendChild(imageDiv);
    });
}

function removeFromLocalStorage(photoId) {
    let existingFavorites = JSON.parse(localStorage.getItem('favorite')) || [];
    
    existingFavorites = existingFavorites.filter(item => item.photo !== photoId);
    
    localStorage.setItem('favorite', JSON.stringify(existingFavorites));
}

function removeFromFavorites() {

    const favoriteItem = document.querySelector('.image-elem');
    console.log(favoriteItem);

    if (favoriteItem) {
        favoriteItem.remove();
        renderSavedPhotos(); 
    }
}
