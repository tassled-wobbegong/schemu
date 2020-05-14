import React, { Component } from 'react';

import { clone, merge } from './util.js';


class userControlPanel extends Component {
  constructor(props){
    super(props);

    this.state ={
      isLoggedIn: false,
      isSigningUp: false,
    }
    this.logIn = this.logIn.bind(this)
    this.signUp = this.signUp.bind(this)
  }


  logIn = (event) => {
    const logInfo = {
      username: event.target.form[0].value,
      password: event.target.form[1].value
    }
    console.log(logInfo)
    // we will post req from here
    fetch('/authenticate/login', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(logInfo),
    })
      .then((response) => response.json())
      .then((result) => console.log(result))
      .catch((err) => console.log(err));
    this.setState({isLoggedIn: true})
   
  }

  signUp = () =>{
    this.setState({isSigningUp:true})
  }

  register = (event) => {
    const logInfo = {
      username: event.target.form[0].value,
      password: event.target.form[1].value
    }
    console.log(logInfo)
    fetch('/authenticate/signup', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(logInfo),
    })
      .catch((err) => console.log(err));
    this.setState({isLoggedIn: true,
                    isSigningUp: false})

  }

  signOut = () =>{
    this.setState({isLoggedIn:false})
  }

  render(){
    // ideally we have some state to determine if the user is logged in or not and we will render one of the three options

      

      const signUp = (<div className = "signUp">
           <form>
            <label htmlFor= "newUsername">Username: </label>
            <input type ="text" id ="newUsername" name= "newUsername" placeholder="username"/>
            <label htmlFor= "newPassword">Password: </label>
            <input type ="password" placeholder = "password" id ="newPassword" name= "newPassword"/>
            <button type ="button">Sign up</button>
          </form>
        </div>)

      // we would put the save-load buttons in here or maybe just the username  along with the log out option
      const loggedIn =  (<div className = "loggedIn">
          Welcome Username
          <br></br>
          
          <br></br>
          <button type="button" >Log Out</button>
        </div>)




    return(
      <div className = "toolbar userPanel">
      { (() => { 
        if(!this.state.isLoggedIn && this.state.isSigningUp){
      return(
        <div className = "signUp">
           <form>
            <label htmlFor= "newUsername">Username: </label>
            <input type ="text" id ="newUsername" name= "newUsername" placeholder="username"/>
            <label htmlFor= "newPassword">Password: </label>
            <input type ="password" placeholder = "password" id ="newPassword" name= "newPassword"/>
            <button type ="button" onClick = {this.register}>Sign up</button>
          </form>
        </div>
      )
       }
       else if(!this.state.isLoggedIn) {
         return(
          <div className = "signIn">
          Login to use to save/load
          <br></br>
          <form>
            <label htmlFor= "username">Username: </label>
            <input type ="text" id ="username" name= "username" placeholder="username"/>
            <label htmlFor= "password" >Password: </label>
            <input type ="password" placeholder = "password" id ="password" name= "password"/>
            <button  type="button" onClick ={this.logIn}>Log In</button>
            </form>
          
           <span onClick ={this.signUp}>Not a user? Sign up</span>
          </div>
       )
       
      }
      else if(this.state.isLoggedIn){
        return(
        <div className = "loggedIn">
          Welcome Username
          <br></br>
          <div className = "save">
          <input ref={this.props.refInputInstance} className="instance-name" type="text" placeholder="instance name"/>
          <button onClick={() => this.props.saveInstance()}>Save</button>
          </div>
          <br></br>
          <div className ="load"> 
          Load:
          {this.props.instanceButtons()}
          </div>
          <br></br>
          <button type="button" onClick = {this.signOut} >Log Out</button>
        </div>
        
        )}
        else if(this.state.isLoggedIn){
          return(
          <div className = "loggedIn">
            Welcome Username
            <br></br>
            <br></br>
            <button type="button" onClick = {this.signOut} >Log Out</button>
          </div>
          
        )}
      })()
    }
      </div>
    )
  }
}

export default userControlPanel
