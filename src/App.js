//import React and css file
import React, {Component} from 'react';
import './App.css';
import { exportDefaultSpecifier, tsConstructorType, blockStatement } from '@babel/types';
import { watchFile } from 'fs';
import { SSL_OP_TLS_ROLLBACK_BUG } from 'constants';

//create class component
class App extends Component{
  //set the original state
  constructor(){
    super()
    this.state = {
      //minute and second hold the minute and second values, stored as strings
      minute: "",
      second: "",
      //variable to see if timer has begun
      timeStart: false,
      //text color set to black, changes to red when equal and below a minute
      color: 'black',
      //class is used to make the timer blink when below ten seconds
      class: 'timer',
      //minuteConcat & secondConcat used to make number like 01:05 instead of 1:5
      //Need a bool since they are called when minute < 10 and can be called infinitely
      minuteConcat: false,
      secondConcat: false,
      //Used for when the timer is done
      displayMessage: false
    }
    //bind our functions
    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.timer = this.timer.bind(this)
    this.timeOver = this.timeOver.bind(this)
    this.reset = this.reset.bind(this)
    this.concateMinute = this.concateMinute.bind(this)
    this.concateSecond = this.concateSecond.bind(this)
  }

//----------------------------------------------------------------------------------------------------------------------

//done to add a 0 to any minute under 10
//mostly for aesthetic, as i belive 4:44 is weirder than 04:44
  concateMinute(bool,min) {
    
    if(min < 10 && !bool){
      this.setState(prevState=>{
        return{
          minute: "0"+ prevState.minute,
          minuteConcat: !prevState.minuteConcat
        }
      })
    }
  }
//same with second as done to minute above
  concateSecond(bool,sec){
    
    if(sec < 10 && !bool){
      this.setState(prevState =>{
        return{
          second: "0" + prevState.second,
          secondConcat: !prevState.secondConcat
        }
      })
    }
  }

//----------------------------------------------------------------------------------------------------------------------
  
  //called in timeOver()
  //resets everything that has been changed to how it should be in the beginning
  //makes it so you can keep setting the timer
  reset(){
    //clears the timeout from timeOver()
    clearTimeout(this.messageTimerID)
    
    this.setState({
      minute:"",
      second:"",
      timeStart:false,
      class:"timer",
      color:'black',
      displayMessage: false,
      minuteConcat:false
    })
  }

//----------------------------------------------------------------------------------------------------------------------
  
  //called when second && minute == 0
  //sets displayMessage to true
  //then waits 5 seconds to call reset()
  timeOver(){

    this.setState({
      displayMessage:true
    })
    
    this.messageTimerID = setTimeout(() =>
      this.reset()
    ,5000)
  }

//----------------------------------------------------------------------------------------------------------------------
  
  //called whenever someone enters something into a text box
  //then it changes the value to what was entered and displays it. 
  handleChange(event){
    
    const{name, value}= event.target
    this.setState({
      [name] : value
    })

  }

//----------------------------------------------------------------------------------------------------------------------

  //called when start button is hit
  //begins the setInterval function
  //which then calls timer()
  //then decrements second by every second
  handleClick(){
    //if nothing was input for minute then set it to 0
    //also works if words were input
    if(isNaN(this.state.minute)){
      this.setState({
          minute:0
        }
      )
    }
    //do the same for second
    //since many people might just input 5 minutes
    if(isNaN(this.state.second)){
      this.setState({
        second:0
      })
    }
    //if second input is greater than 60 adjust accordingly
    if(this.state.second >= 60){
      //leak is the remainder from second / 60
      let leak = this.state.second % 60
      //find added minute by dividing second by 60
      let addedMin = this.state.second / 60
      //since it will most likely be a double, floor to an int
      addedMin = Math.floor(addedMin)
      //set with new numbers
      this.setState(prevState =>{
        return{
          second: leak,
          //because of minute being set to string, must use Number to add values
          //else they will just concatenate
          minute: Number(prevState.minute) + Number(addedMin)
        }
      })
    }
    //set timeStart to true since timer has begun
    //set second & minuteConcat to false 
    this.setState({
      timeStart:true,
      secondConcat: false,
      minuteConcat: false
    })

    //if you start under a minute make sure that the text is red
    //if not here than it will begin black and shift to red a second later
    if(this.state.minute < 1 && this.state.second > 0){
      this.setState({
        color:"red"
      })
    }
    //same logic here with blinking as above with red text
    if(this.state.minute < 1 && this.state.second <=10){
      this.setState({
        class:"blinking"
      })
    }
    //then check both minute and concat if they need to be concatenated with a 0 instantly
    //if not done then the first number in timer will be different then rest
    //i.e. it will go 4:5 to 04:05
    this.concateMinute(this.state.minuteConcat,this.state.minute)
    this.concateSecond(this.state.secondConcat,this.state.second)
    //now call timer every second
    this.timerID = setInterval(
      () => this.timer()
      ,1000)
  }

//----------------------------------------------------------------------------------------------------------------------

  //the meat of the code, does most of the work 
  //does a lot of logic checking as well
  timer = () => {
    //first check if second is greater than 0
    if(this.state.second > 0){
      //if so then subtract one from second 
      //also set timeStart to true so it 
      //set secondConcat to false so it updates every second
      this.setState(prevState =>{
        return{
          second: prevState.second - 1,
          secondConcat: false
        }
      })
    }
    // when second = 0 then subtract one from minute if its greater than or equal to 1
    // then set minute Concat to false
    //this is done so it concatenates 0 again
    if(this.state.second <= 0 && this.state.minute >= 1){
      
      this.setState(prevState =>{
        return{
          minute: prevState.minute - 1,
          //set second to 60 as code does not work well with display value at just 0
          //also cant set second when second is < 0 because it does not go below 0 
          //not sure why that is, if anyone sees this and knows why help is appreciated
          second: 60,
          minuteConcat: false
        }
      })

    }
    //if at/under a minute turn the text red
     if(this.state.minute == 0 && this.state.second <= 60){
       
      this.setState({
         color: "red"
       })

    }
    //call concateMinute & second to concatenate a 0 if needed
    this.concateMinute(this.state.minuteConcat,this.state.minute)
    this.concateSecond(this.state.secondConcat,this.state.second)
    //if at/under ten seconds then have the numbers blink
    //done by changing the class to blinking
    if(this.state.minute == 0 && this.state.second <=10){
      
      this.setState({
        class:"blinking"
      })

    }
    //once timer is over then display message 
    //do this by calling timeOver()
    //also clear the interval so it does not keep running in the background
    if(this.state.second == 0 && this.state.minute == 0){
      clearInterval(this.timerID)
      this.timeOver()
    }
  }
//----------------------------------------------------------------------------------------------------------------------
//now onto what is actually put onto the webpage
  render(){

    return(
      //body is used to hold all jsx, also hold background color and text-align
      <body>
        {/*simple header*/}
        <header>Pomodoro Application</header>
        {/* if display message is true, do not show text boxes
            else only show text box if timeStart is false
            done for both text boxes
            nested ternaries
        */}
        {this.state.displayMessage ? null 
        :
        this.state.timeStart ? null
        :

        <input
          type = "text"
          placeholder= "Minutes"
          onChange = {this.handleChange}
          name = "minute"
          value = {this.state.minute}
        />}


        {this.state.displayMessage ? null 
        :
        this.state.timeStart ? null 
        :

        <input 
          type = "text"
          placeholder = "Seconds"
          onChange = {this.handleChange}
          name = "second"
          value = {this.state.second}
        />}

        {/*
          Now here is a nested ternary
          first ternary asks if display Message if true
          if so says Time's Up, else it goes to another ternary
          This ternary asks if timeStart is true
          if so it shows the timer running and text saying Timer Running!
          if false then shows start button and text saying Enter a Time!
        */}
        { this.state.displayMessage ? <p className = "timeUp">Time's Up!</p> : 

          this.state.timeStart ? <div><p className = {this.state.class} style = {{color: this.state.color}}>{this.state.minute}:{this.state.second}</p>
          <p className="timeText">Timer Running!</p> 
          </div>
          
          :

          <div><button onClick={this.handleClick}>Start</button>
          <p className = "timeText">Enter a Time!</p>
          </div>
        }
      </body>
    )
  }
}
//export back to index.js
export default App;
