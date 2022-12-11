/* ---- This file is not used right now -----
    It is the same page but created for several users
*/

// Imports
import './App.css';
import {useEffect, useState} from 'react'
import axios from 'axios'

// Diqus service
import { DiscussionEmbed } from 'disqus-react';

// The Spotify-logo must be used when using their API
import spotifyLogo from './images/Spotify_Logo_RGB_Green.png'

// Design from react-bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  // Variables to connect with Spotify
  // const SPOTIFY_REDIRECT_URI="http://localhost:3000"
  const SPOTIFY_REDIRECT_URI= "https://ylvader.github.io/-4ME304_Assignment2/"
  const SPOTIFY_CLIENT_ID="aa154d5d0093466c84e7a422863e09a4"
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize"
  const RESPONSE_TYPE = "token"

  // State variables
  // Spotify
  //const [token, setToken] = useState("")
  const token = "BQBsirDrpBzv7h2tyFBFWx5hw2VZJU9azk_nwrib26e77MjbeosifjzrW9ljjS2Y4BxBSKRpRQyzknl3NGy9ED23NNihDq0smwKKApdhAxSAj0oOy1CInx6_aH2v5qOBCveOXlagBi7dfK7OER5aoog28kEcfU8kE14iDNfHqfbw8sHQDceE2-x7vwjceixan5Y"
  const [searchKey, setSearchKey] = useState("")
  const [artists, setArtists] = useState([])

  // To get information about a selected artist
  const [selectedArtist, setSelectedArtist] = useState("")

  // Wikipedia
  const [wikiResults, setWikiResults] = useState([]);
  // const [searchInfo, setSearchInfo] = useState({});

  // Get access token from Spotify-login using useEffect
  // Inspiration from: https://www.youtube.com/watch?v=wBq3HCvYfUg
  // This is how you do it if you want to allow several users, but since we want
  // simplicity in a Mashup, we are using a central account
  /*
  useEffect(() => {
    // Get hash and token from the URL (access_token)
    const hash = window.location.hash
    let token = window.localStorage.getItem("token") // localstorage: gets data from the browser to get data

    // If we dont have a token and have a hash, we have to get our token
    if (!token && hash) {
      // Remove hashtag from the beginning and split string from "&" and "=" (from browser) to get access_token from browser
      // we get an array so we need "find"
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
      console.log("token")
      console.log(token)
      //BQBsirDrpBzv7h2tyFBFWx5hw2VZJU9azk_nwrib26e77MjbeosifjzrW9ljjS2Y4BxBSKRpRQyzknl3NGy9ED23NNihDq0smwKKApdhAxSAj0oOy1CInx6_aH2v5qOBCveOXlagBi7dfK7OER5aoog28kEcfU8kE14iDNfHqfbw8sHQDceE2-x7vwjceixan5Y

      // Clear the hash
      window.location.hash = ""

      // Set the token
      window.localStorage.setItem("token", token) 
    }
      setToken(token)
  }, [])
  */

  // Sign out from Spotify by clearing the token (if you have several users)
  /*
  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }
  */

  // Search for artists and also pass the event
  // Does http requests - async because we are waiting for axios
  const searchArtists = async (e) => {

    // Avoid reloading of page because React does that every time you submit a form
    e.preventDefault()

    // Get the data from Spotify using the token from the central account
    const {data} = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: searchKey,
        type: "artist"
      }
    })

    // Set artists from the data
    setArtists(data.artists.items)
  }

  // Render the artists (from search result) in a list by using map()
  const renderArtists = () => {
    return artists.map(artist => (
      <div key={artist.id}>

        <div id="artistContainer">
          {/* Show image if the artist has an image*/}
          {artist.images.length ? 
            <img id="artistImage" src={artist.images[0].url} alt=""/> 
          : 
          <div></div>}
          
            <p>{artist.name}</p>

            {/* Select an artist, which shows various information about the artist */}
            <button onClick={() => setSelectedArtist(artist.name)} id="selectButton">Select</button>
        </div>
      </div>
    ))    
  }

  // Wait for the data (selectedArtist) to be updated before showing information from Wikipedia
  useEffect(() => {
    console.log(selectedArtist)
    handleWikiInfo(selectedArtist);
  }, [selectedArtist])

  // Handle information from Wikipedia
  // Inspiration from: https://www.youtube.com/watch?v=Gyg5R8Sfo1U
  const handleWikiInfo = async (selected_Artist) => { 

    // Do a call to the Wikipedia API with various parameters
    // ex. srlimit is number of results per page
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srlimit=2&tllimit=500&srsearch=${selected_Artist}+incategory:Living_people|Music|Musicians|Singers|People|Singing|Dance_musicians|Singers_by_nationality|Songs_by_artist|Grammy_Award_winners`;

    // Fetch response
    const response = await fetch(endpoint);
    console.log("wiki")
    
    // Check for errors and throw a error in case of errors
    if (!response.ok) {
      throw Error(response.statusText);
    }

    // Call for json to get the data from the response
    const jsons = await response.json();

    // Set the result from the json object
    setWikiResults(jsons.query.search);
    
    // If you want to show number of results:
    // setSearchInfo(jsons.query.searchinfo);
  }

  // HTML rendering
  return (
    <div className="App">
      <header className="App-header">
        <div id="titleContainer">
          <h1 id="Apptitle">Find artists, information, and discuss</h1>
        </div>

        {/* Sign in/Sign out section
          If we dont have a token, render login button, otherwise log out (If serveral users)*/}

        <div id="authContainer">
          <p id="supporttext">This app is supported by</p> 
          <img id="spotifylogo" src={spotifyLogo} alt="Logo"/>
          {! token ?
          <a id="signinbutton" href={`${AUTH_ENDPOINT}?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${SPOTIFY_REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>
            Sign in with Spotify</a>
          :
          <div>
            
            
          </div>} 
        </div>
    
        {/* Search for artist section
            Show search bar if we are logged in, otherwise please log in: type="text" search key*/}
        <div id="searchContainer">
        {token ?
          <form id="searchField" onSubmit={searchArtists}>
            <input type="text" onChange={e => setSearchKey(e.target.value)}/>
            <button className="searchButton" type={"submit"}>Search</button>
        </form> 
   
      : <form id="searchField">
          <input type="text"/>
          <button className="searchButton">Search</button>
          <p id="needtologin">Sign in with Spotify to search for artists</p>
        </form> 
      }
      </div>

      {/* Render artists/songs if the user is signed in*/}
      <div id="artistSongsContainer">
      {token ?
          renderArtists()
   
      : ''
      }
      </div>

      {/* Information about the artist from the Wikipedia API
        Different information is shown to the user based on if the user is signed in and
        has selected an artist.*/}
      <div id="infoContainer">
        {!token ? 
          <div><p className="smallTitle">Information about the artist</p>
              <p>Sign in with Spotify, search for artists to 
              get information about the artist.</p></div>
        : !selectedArtist ?
          <div><p className="smallTitle">Information about the artist</p>
            <p>Search for an artist. Then select it to show information about 
            the artist.</p></div>
            : 
            <div className="results">
              <p className="smallTitle">Information regarding {selectedArtist}</p>
              {wikiResults.map((result, i) => {
                const url = `https://en.wikipedia.org/?curid=${result.pageid}`
                return (
                  <div className='results' key={i}>
                    <h3>{result.title}</h3>

                    <p dangerouslySetInnerHTML={{__html: result.snippet}}></p>
                    <a id="readmore" href={url} target="_blank" rel="nofollow">Read more on Wikipedia</a>
                  </div>
                )
              })}
            </div>
              
          }
      </div>

      {/* Discussion about the artist with Disqus */}
      <div id="discussContainer">
        <p className="smallTitle">Discuss about artists</p>
        <DiscussionEmbed
          shortname='Discussion'
          config={
            {
              url: 'https://mashup-2.disqus.com/',
              identifier: 'https://mashup-2.disqus.com/',
              title: 'Discuss about artists',
            }
         }
        />
      </div>
      </header>
    </div>
  )
}

export default App;
