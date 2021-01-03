import './App.css';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import Particles from 'react-particles-js';
import React, { Component } from 'react';
import Clarifai from 'clarifai';
import Signin from './components/Signin/Signin';
import Register from './components/Register/Register';

const app = new Clarifai.App({
  apiKey: '296bb017507e40339d54a3d269231793'
 });

const particlesOptions = {
  particles: {
    number:{
      value: 200,
      density: {
        enable: true,
        value_area: 800
      }
    }
  },
  interactivity:{
    detect_on: "canvas",
    events:{
      onhover:{
        enable: true,
        mode: "repulse"
      },
      onclick:{
        enable: true,
        mode: "push"
      }
    }
  }
}


class App extends Component{
  constructor(){
    super();
    this.state ={
      input:'',
      imageUrl: '',
      box: {},
      route: 'Signin',
      isSignedIn: false,
      user: {
        id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
      }
    }
  }

  loadUser = (data) => {
    this.setState({user:{
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined: data.joined
    }})
  }

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    // console.log(width, height);
    return{
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width *(1 - clarifaiFace.right_col),
      bottomRow: height*(1-clarifaiFace.bottom_row)
    }
  }

  // componentDidMount() {
  //   fetch('http://localhost:3000/')
  //     .then(response => response.json())
  //     .then(console.log) //data => console.log(data)
  // }

  displayFaceBox = (box) => {
    this.setState({box: box});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = () =>{
    this.setState({imageUrl: this.state.input});
    // console.log('click');
    // app.models.initModel({id: Clarifai.GENERAL_MODEL, version: "aa7f35c01e0642fda5cf400f543e7c40"})
    //   .then(generalModel => {
    //     return generalModel.predict("https://upload.wikimedia.org/wikipedia/commons/d/d5/Lana_Del_Rey_%40_Grammy_Museum_10_13_2019_%2849311023203%29.jpg");
    //   })
    //   .then(response => {
    //     console.log(response)
    //     var concepts = response['outputs'][0]['data']['concepts']
    //   })
    app.models
    .predict(
      {id: "e15d0f873e66047e579f90cf82c9882z",
        version:'0df9eb6c71674ada9bbec68729aa1c4c'}, 
        this.state.input)
        .then(response => {
          if (response){
            fetch('http://localhost:3000/image',{
              method:'put',
              headers:{'Content-Type': 'application/json'},
              body: JSON.stringify({
                id:this.state.user.id
              })
            })
              .then(response => response.json())
              .then(count => {
                this.setState(Object.assign(this.state.user,{entries:count}))
              })
          }
          this.displayFaceBox(this.calculateFaceLocation(response))
        })
            //console.log(response.outputs[0].data.regions[0].region_info.bounding_box)
        .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if (route === 'signout'){
      this.setState({isSignedIn: false})
    } 
    else if(route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  render(){
    const { isSignedIn, imageUrl, route, box} = this.state;
    return (
      <div className="App">
        <Particles className = 'particles'
              params={particlesOptions}
            />
        <Navigation isSignedIn={this.state.isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === 'home'  
          ? 
          <div>
              <Logo />
              <Rank 
                name={this.state.user.name}
                entries={this.state.user.entries}
              />
              <ImageLinkForm 
                onInputChange={this.onInputChange} 
                onButtonSubmit={this.onButtonSubmit}/>
              <FaceRecognition 
                box={box}
                imageUrl={imageUrl}/>
            </div>
            : (
              route === 'Signin'
              ? <Signin loadUser={this.loadUser} onRouteChange={this.onRouteChange}/> 
              : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
            )
        }
      </div>
    );
  }
}

export default App;

