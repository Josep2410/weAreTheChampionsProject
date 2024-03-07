import {initializeApp} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import {getDatabase , ref , push , onValue, remove, update} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import {format} from 'date-fns'

const appSettings = {
  databaseURL : "https://we-are-the-champions-66acd-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const endorsementsInDB = ref(database , "endorsements")

const textAreaEl = document.getElementById("writeEndorsement")
const btn = document.getElementById("publishBTN")
const enfsContainer = document.getElementById("enforsementsContainer")
const fromInput = document.getElementById("fromInput")
const toInput = document.getElementById("toInput")
const windowWidth = window.innerWidth


btn.addEventListener("click" , (e) =>{
  const text = textAreaEl.value
  if(!text) disableElment(textAreaEl, 'textarea')
  else if(!fromInput.value) disableElment(fromInput, 'from')
  else if(!toInput.value) disableElment(toInput, 'to')
  else{
    //push(endorsementsInDB , value)
    const date = format(new Date() , "MM/dd/yy")
    push(endorsementsInDB , 
      { 
        text , 
        from : fromInput.value , 
        to : toInput.value , 
        date,
        likes : 0 ,
        canLike : true
      })
    
  }

  clearElementsValue(textAreaEl)
  clearElementsValue(fromInput)
  clearElementsValue(toInput)

  //appendEltoEndorsmentsContainer(value)
  
})


// depending on element and text, disable element
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

// anytime db changes, this function runs
onValue(endorsementsInDB , function(snapshot){
  clearEndorsementsContainer()
  if(snapshot.exists()){
    let items = Object.entries(snapshot.val())
    for(let item of items){
      appendEltoEndorsmentsContainer(item)

    }
  }
  else{
    enfsContainer.innerHTML = `<p class="emptyContainer">Empty</p>`
  }
})

function clearEndorsementsContainer(){
  enfsContainer.innerHTML = ''
}

function clearElementsValue(elem){
  elem.value = ""
}

function appendEltoEndorsmentsContainer(item){

    const id = item[0]

    let {text , from , to , date , likes , canLike } = item[1]
    
    const div = document.createElement("div")
    
    div.innerHTML = renderDivContent(text, to, from , date , likes )
  
    div.setAttribute("class" , "indivdual_endors")
    enfsContainer.prepend(div)

    // likesContainer rendered by renderDivContent function
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

