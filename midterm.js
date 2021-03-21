//CONSTANTS:

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
const breedBaseInfoURL = "https://en.wikipedia.org/w/api.php?action=parse&format=json&origin=*&page="

//VARIABLES:

favoritesElementsArray = []
let dogObject

//PAGE LOAD EVENT:

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

//SELECT DOG BREED BUTTON:

//Select a dog breed and display its information and a picture
btnSelectDogBreed.addEventListener("click", () => {
    
    removeOldDogInfo()

    //take selected breed name from drop down menu & use for urls
    let breed = menuDogBreedsElement.value

    //creates dogInfo div which will contain all of the other elements
    let dogInfo = document.createElement("div")
    dogInfo.id = "dog-info"

    //add name of breed to dogInfo
    let dogName = document.createElement("h2") 
    dogName.innerHTML = breed.toUpperCase()
    dogName.classList.add("title")
    dogInfo.appendChild(dogName)
    
    //add random image to dogInfo
    dogInfo.appendChild(getDogBreedImage(breed))
    
    //add Wikipedia info to dogInfo
    dogInfo.appendChild(getDogBreedInfo(breed))

    //put breed name and dogInfo div in global dogObject variable for use with favorites list
    dogObject = {breed: breed, info: dogInfo}

    //add dogInfo div with all of that stuff in it to the div for displaying breed info
    breedInfoDisplayContainer.appendChild(dogInfo)

    //show/enable dog breed info div and faves button
    btnAddToFavorites.disabled = false
    breedInfoDisplayContainer.style.display = "block"
    
})

//FUNCTIONS for SELECT DOG BREED BUTTON:

//There was so much going on in each event that I was starting to get confused
//so I separated some of the stuff out into functions

function removeOldDogInfo() {
    //gets rid of pre-existing dog info if present

    let dogInfoOld = document.querySelector("#dog-info")
    if (dogInfoOld != null) dogInfoOld.remove() //remove the dog info element
    dogObject = {} //clear dogObject
    btnAddToFavorites.disabled = true //disable faves button
}

function getDogBreedImage(breed) {
    //gets a random image of the dog breed

    //create an element for random dog image
    let dogImg = document.createElement("img") 
    dogImg.classList.add("dog-img") 
    
    //put together url based on breed
    let breedPictureURL = breedImgURL1 + breed + breedImgURL2

    //get dog breed img to use for img on page
    fetch(breedPictureURL)
    .then(response => response.json())
    .then(breed => dogImg.src = breed.message) //add img url to src of img element
    .catch(error => {
        alert("Error fetching dog image.")
        console.log(error)
    })
    
    return dogImg
}

function getDogBreedInfo(breed) {
    //gets information from Wikipedia about the dog breed

    //create element for dog breed info
    let dogTemperament = document.createElement("div")

    //create variable to store info fetched from wikipedia
    let temperamentHTML

    //put together URL based on breed
    let breedInfoURL = breedBaseInfoURL + breed

    //error message
    let errorMessage = "Unable to fetch breed information from Wikipedia. " +
    "Please try searching elsewhere for breed temperament."

    //get just the sections in the article so I can find "Temperament"
    fetch(breedInfoURL + "&prop=sections")
    .then( response => response.json())
    .then(breed => {
           let sections = breed.parse.sections
           let sectionIndex
           sections.forEach(section => {
               if (section.line === "Temperament")
                   sectionIndex = section.index
           })
           if (sectionIndex != null) {
               //add section parameter to URL to fetch just Temperament section & disable edit links
                let breedTemperamentURL = breedInfoURL + "&disableeditsection=true" + "&section=" + sectionIndex
                fetch(breedTemperamentURL)
                .then(response => response.json())
                .then(temperament => {
                    temperamentHTML = (temperament.parse.text["*"])
                    addTemperamentHTML()
                })
                .catch(error => { //displayed if there is an error with fetch of Temperament section
                    console.log("Error fetching dog breed info.")
                    console.log(error)
                    temperamentHTML = errorMessage
                    addTemperamentHTML()
                })
            }
           else { //displayed if there is no Temperament section in the article
               temperamentHTML = errorMessage
               addTemperamentHTML()
           }
       })
       .catch(error => { //displayed if there is an error for initial fetch of sections
           console.log("Error fetching dog breed info.")
           console.log(error)
           temperamentHTML = errorMessage
           addTemperamentHTML()
       })

       function addTemperamentHTML() {
        //adds temperamentHTML to dogTemperament after reworking it a litte
        //I made images stop displaying and turned all the anchor tags into spans because none of the links/srcs were working
        //I had to look this up because I didn't remember how to replace / or if we had gone over that
        //https://stackoverflow.com/questions/5854352/how-to-do-a-global-replace-on-backslash-in-a-string-in-javascript/5854429#5854429
    
        let temperamentHTMLReworked = temperamentHTML.replace(/<div class="thumbinner"/g, '<div style="display: none;"')
        temperamentHTMLReworked = temperamentHTMLReworked.replace(/<a/g, "<span")
        temperamentHTMLReworked = temperamentHTMLReworked.replace(/<\\a>/g, "</span>")

        dogTemperament.innerHTML = temperamentHTMLReworked //add whatever I found from wikipedia or an error msg to dogTemperament
    }

    return dogTemperament

}



//ADD TO FAVORITES BUTTON:

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

    //make div for the dog's entry in the favorites list
    let favoriteDogDiv = document.createElement("div")
    favoriteDogDiv.classList.add("favorite-dog")
    favoriteDogDiv.id = breed

    //add dog breed button to favorite dog div
    favoriteDogDiv.appendChild(createFavoritesButton(breed))

    //add remove button to favorite dog div
    favoriteDogDiv.appendChild(createRemoveButton(breed))

    //add favorite dog div to sidebar
    favoritesContainerElement.appendChild(favoriteDogDiv)

    //add dog info to the favorites list array
    favoritesElementsArray.push(dogObject)

})

//FUNCTIONS for ADD TO FAVORITES BUTTON:

function createFavoritesButton(breed) {

    //create button for dog info
    let btnFavorite = document.createElement("button")
    btnFavorite.classList.add("btn")
    btnFavorite.classList.add("btn-primary")
    btnFavorite.name = breed
    btnFavorite.innerHTML = breed

    //when clicking button in favorites list to recall dog info
    btnFavorite.addEventListener("click", () => {
        let breedSelected = btnFavorite.innerHTML
        //looks for the dog by breed in the dog objects list, then displays
        favoritesElementsArray.forEach((dog) => {
            let comparison = dog.breed
            if (breedSelected === comparison) {
                removeOldDogInfo()
                breedInfoDisplayContainer.appendChild(dog.info)
            }
        })
    })

    return btnFavorite

}

function createRemoveButton(breed) {

    //create button for remove from faves
    let btnRemoveFavorite = document.createElement("button")
    btnRemoveFavorite.classList.add("btn")
    btnRemoveFavorite.classList.add("btn-danger")
    btnRemoveFavorite.classList.add("btn-remove")
    btnRemoveFavorite.name = breed
    btnRemoveFavorite.innerHTML = "-"

    //clicking remove button next to dog to remove from faves
    btnRemoveFavorite.addEventListener("click", () => {

        let breedSelected = btnRemoveFavorite.name
        let selector = "#" + breedSelected;
        let index

        //delete dog object from faves array by breed
        favoritesElementsArray.forEach((dog) => {
            let comparison = dog.breed
            if (breedSelected === comparison) {
                index = favoritesElementsArray.indexOf(dog)
                favoritesElementsArray.splice(index, 1)
            }
        })
        //delete div containing the fave and delete buttons
        let divToRemove = document.querySelector(selector)
        divToRemove.remove()
    })

    return btnRemoveFavorite

}

//DARK MODE TOGGLE for my eyes:

btnDarkModeToggle.addEventListener("click", () => {
    divPage.classList.toggle("dark")
    divContainerArray.forEach(div => div.classList.toggle("dark"))
})