// import functions to use and setup firebase DB
import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import {getDatabase , ref , push , onValue, remove, update} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import {format} from 'date-fns'

// setting up Firebase DB
const appSettings = {
  databaseURL : "https://we-are-the-champions-66acd-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const endorsementsInDB = ref(database , "endorsements")

//End Firebase setup

// Initialize consts from HTML 
const textAreaEl = document.getElementById("writeEndorsement")
const btn = document.getElementById("publishBTN")
const endsContainer = document.getElementById("endorsementsContainer")
const fromInput = document.getElementById("fromInput")
const toInput = document.getElementById("toInput")

// when Publish btn is pressed, determine if there are any input fields or not and handle accordingly
btn.addEventListener("click" , (e) =>{
  const text = textAreaEl.value
  if(!text) disableElment(textAreaEl, 'textarea')
  else if(!fromInput.value) disableElment(fromInput, 'from')
  else if(!toInput.value) disableElment(toInput, 'to')
  else{

    const date = format(new Date() , "MM/dd/yy")

    //will cause onValue() to run since push() will cause a change in DB 
    push(endorsementsInDB , 
      { 
        text , 
        from : fromInput.value , 
        to : toInput.value , 
        date,
        likes : 0 ,
        canLike : true
      })
      
    clearElementsValue(textAreaEl)
    clearElementsValue(fromInput)
    clearElementsValue(toInput)
    
  }
  
})


// disable and highlight element that requires attention
function disableElment(element , str){
  element.disabled = true
  btn.disabled = true
  btn.classList.remove("publish")
  btn.classList.add("invalidText")

  if(str === 'textarea'){
    btn.textContent = `Enter valid text`
    element.disabled = true
  } 
  else if(str === 'from') {
    btn.textContent = "From required"
    element.disabled = true
  }
  else{
    btn.textContent = 'To required'
    element.disabled = true
  } 
  setTimeout(function(){
    btn.disabled = false
    element.disabled = false 
    btn.classList.remove("invalidText")
    btn.classList.add("publish")
    btn.textContent = "Publish"
  }, 2000)
}

// anytime db changes (an endorsement is published, updated or deleted), this function runs
onValue(endorsementsInDB , function(snapshot){
  clearEndorsementsContainer()
  if(snapshot.exists()){
    let items = Object.entries(snapshot.val())
    for(let item of items){
      appendEltoEndorsmentsContainer(item)

    }
  }
  else{
    endsContainer.innerHTML = `<p class="emptyContainer">Empty</p>`
  }
})

function clearEndorsementsContainer(){
  endsContainer.innerHTML = ''
}

function clearElementsValue(elem){
  elem.value = ""
}

//publish written endorsement to DOM
function appendEltoEndorsmentsContainer(item){

    const id = item[0]

    let {text , from , to , date , likes , canLike } = item[1]
    
    const div = document.createElement("div")
    
    div.innerHTML = renderDivContent(text, to, from , date , likes )
  
    div.setAttribute("class" , "indivdual_endors")
    endsContainer.prepend(div)

    // likesContainer instance rendered from renderDivContent function
    const likesContainer = document.getElementById("likesContainer")
  
    likesContainer.addEventListener("click" , () => {
      updateLikes(canLike , likes , id)
    })
  
      div.addEventListener("dblclick" , ()=> {
        deleteEndorsement(id)
       })
   
 
}

function deleteEndorsement(id){
  let locationInDB = ref(database , `endorsements/${id}`) 
  remove(locationInDB) 
  // remove() will cause 'onValue' function to run since a change is being made to DB
}

function renderDivContent(text, to, from , date , likes ){
  return  ( `<div class="spaceBetween">
              <h4>To: ${to}</h4>
              <span class="date">${date}</span>
            </div>
            <p>${text}</p>
            <div class="spaceBetween">
              <h4>From: ${from}</h4>
              <span id="likesContainer"> 
                <img class="heartSVG" src=${likes ? "heart-solid.svg" : "heart-regular.svg"} alt="heart"/>
                <span class=${likes ? "" : "hide"}>${likes}</span>
              </span>
            </div>
            `)
}

function updateLikes(bool , likes , id){
  let locationInDB = ref(database , `endorsements/${id}`) 

  if(bool) update(locationInDB , {likes : likes + 1 , canLike : false})
  else update(locationInDB , {likes : likes - 1 <= 0 ? 0 : likes - 1 , canLike : true})
}

