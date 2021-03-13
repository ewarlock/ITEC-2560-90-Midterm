//TODO finish wiki portion?

//breed search elements
const menuDogBreedsElement = document.querySelector("#dog-breeds-menu") //drop down for breed select
const btnSelectDogBreed = document.querySelector("#select-breed") //button to select a breed for info
const btnAddToFavorites = document.querySelector("#add-to-favorites") //add to favorites button

//add breed info elements as child of this container
const breedInfoDisplayContainer = document.querySelector("#breed-info-container")

//instructions for adding to favorites, modify after user adds something to faves ?
const favoritesInstructionsElement = document.querySelector("#favorites-instructions")

//add favorite elements as child of this container
const favoritesContainerElement = document.querySelector("#favorites-container")

//styling elements
const btnDarkModeToggle = document.querySelector("#dark-mode")
const divPage = document.querySelector(".page")
const divContainerArray = document.querySelectorAll(".container")

//URLs for dog image API
const allBreedsURL = "https://dog.ceo/api/breeds/list/all"
const breedImgURL1 = "https://dog.ceo/api/breed/"
const breedImgURL2 = "/images/random"

//URL for wikipedia API
const breedBaseInfoURL = "https://en.wikipedia.org/w/api.php?action=parse&format=json&page="

//variables
favoritesElementsArray = []
let dogObject

//get list of dog breeds from API on page load
//used to populate select element with options
this.addEventListener("load", () => {
    fetch(allBreedsURL)
    .then( response => response.json())
    .then(breeds => {
        for (key in breeds.message) {
            let breed = document.createElement("option")
            breed.innerHTML = key
            menuDogBreedsElement.add(breed)
        }
    })
    .catch(error => {
        alert("Error fetching dog breed list.")
        console.log(error)
    })
})

//gets rid of pre-existing dog info if present
//disables add to favorites button
function removeOldDogInfo() {
        let dogInfoOld = document.querySelector("#dog-info")
        if (dogInfoOld != null)
            dogInfoOld.remove()
        dogObject = {}
        btnAddToFavorites.disabled = true
}

//dark mode toggle for my eyes
btnDarkModeToggle.addEventListener("click", () => {
    divPage.classList.toggle("dark")
    divContainerArray.forEach(div => div.classList.toggle("dark"))
})

//event to select dog breed and load info based on that breed
btnSelectDogBreed.addEventListener("click", () => {
    
    removeOldDogInfo()

    //take selected breed name from drop down menu & use for urls
    let breed = menuDogBreedsElement.value
    let breedPictureURL = breedImgURL1 + breed + breedImgURL2 //for picture
    let breedInfoURL = breedBaseInfoURL + breed //for wikipedia

    //create elements to insert into page
    let dogInfo = document.createElement("div")
    dogInfo.id = "dog-info"
    let dogImg = document.createElement("img")
    dogImg.classList.add("dog-img")
    let dogName = document.createElement("h2")
    dogName.innerHTML = breed.toUpperCase()
    dogName.classList.add("title")
    dogInfo.appendChild(dogName)


    //get dog breed img to use for img on page
    fetch(breedPictureURL)
    .then(response => response.json())
    .then(breed => dogImg.src = breed.message) //add img url to src of img element
    .catch(error => {
        alert("Error fetching dog image.")
        console.log(error)
    })
    dogInfo.appendChild(dogImg)

    //get dog breed info and put in div under img TODO!!!
    //using breedTestURL for now to see if I can get it to work but
    //if I can get it working should update to breedInfoURL
let breedTestURL = "https://en.wikipedia.org/w/api.php?action=parse&format=json&page=Great_Dane"
    fetch(breedTestURL)
    .then( response => {
        response.json()})
    .then(breeds => {
        console.log(breeds)
    })
    .catch(error => {
        console.log("Error fetching dog breed info.")
        console.log(error)
    })


    //put breed name and dogInfo div in global dogObject variable for use with favorites list
    dogObject = {breed: breed, info: dogInfo}

    //add dogInfo div with all of that stuff in it to the div for displaying breed info
    breedInfoDisplayContainer.appendChild(dogInfo)

    //show/enable dog breed info div and faves button
    btnAddToFavorites.disabled = false
    breedInfoDisplayContainer.style.display = "block"
})


//favorites list functionality!
btnAddToFavorites.addEventListener("click", () => {

    let breed = dogObject.breed

    //don't let user add same breed to favorites twice
    let favesChecker = 0
    favoritesElementsArray.forEach((dog) => {
        let comparison = dog.breed
        if (breed === comparison) {
            alert("Dog breed is already in favorites!")
            favesChecker++ //it didn't work when I just put return here
            //presumably because it was returning from the loop and not the event ?
        }
    })
    if (favesChecker > 0) return

    btnAddToFavorites.disabled = true

    //make div for dog info
    let favoriteDogDiv = document.createElement("div")
    favoriteDogDiv.classList.add("favorite-dog")
    favoriteDogDiv.id = breed

    //create button for dog info
    let btnFavoriteElement = document.createElement("button")
    btnFavoriteElement.classList.add("btn")
    btnFavoriteElement.classList.add("btn-primary")
    btnFavoriteElement.name = breed
    btnFavoriteElement.innerHTML = breed

    //create button for remove from faves
    let btnRemoveFavorite = document.createElement("button")
    btnRemoveFavorite.classList.add("btn")
    btnRemoveFavorite.classList.add("btn-danger")
    btnRemoveFavorite.classList.add("btn-remove")
    btnRemoveFavorite.name = breed
    btnRemoveFavorite.innerHTML = "-"

    //add dog info to the array
    favoritesElementsArray.push(dogObject)

    //add event listeners for the buttons I just made
//when clicking button in favorites list to recall dog info
btnFavoriteElement.addEventListener("click", () => {
    let breed = btnFavoriteElement.innerHTML
        //looks for the dog by breed in the dog objects list, then displays
    favoritesElementsArray.forEach((dog) => {
        let comparison = dog.breed
        if (breed === comparison) {
            removeOldDogInfo()
            breedInfoDisplayContainer.appendChild(dog.info)
        }
    })
})
//clicking remove button next to dog to remove from faves
btnRemoveFavorite.addEventListener("click", () => {

    let breed = btnRemoveFavorite.name
    let selector = "#" + breed;
    let index

    //delete dog object from faves array by breed
    favoritesElementsArray.forEach((dog) => {
        let comparison = dog.breed
        if (breed === comparison) {
            index = favoritesElementsArray.indexOf(dog)
            favoritesElementsArray.splice(index, 1)
        }
    })
    //delete div containing the fave and delete buttons
    let divToRemove = document.querySelector(selector)
    divToRemove.remove()
})

    //add all the elements I just made in add to favorites event to the sidebar
    favoriteDogDiv.appendChild(btnFavoriteElement)
    favoriteDogDiv.appendChild(btnRemoveFavorite)
    favoritesContainerElement.appendChild(favoriteDogDiv)
})
