// Imports
import './App.css';
import {useEffect, useState} from 'react'
import axios from 'axios'

// Diqus service
import { DiscussionEmbed } from 'disqus-react';

// The Spotify-logo must be used when using their API
import spotifyLogo from './images/Spotify_Logo_RGB_Green.png'

// @ TODO: Test, remove TODOs, clear code

function App() {
  // Variables to connect with Spotify
  const SPOTIFY_REDIRECT_URI=process.env.SPOTIFY_REDIRECT_URI
  const SPOTIFY_CLIENT_ID=process.env.SPOTIFY_CLIENT_ID
  const AUTH_ENDPOINT = process.env.AUTH_ENDPOINT
  const RESPONSE_TYPE = process.env.RESPONSE_TYPE

  // State variables
  // Spotify
  const [token, setToken] = useState("")
  const [searchKey, setSearchKey] = useState("")
  const [artists, setArtists] = useState([])

  // To get information about a selected artist
  const [selectedArtist, setSelectedArtist] = useState("")

  // Wikipedia
  const [wikiResults, setWikiResults] = useState([]);
  //const [searchInfo, setSearchInfo] = useState({});

  // Get access token from Spotify-login using useEffect
  // Inspiration from: https://www.youtube.com/watch?v=wBq3HCvYfUg
  useEffect(() => {
    // Get hash and token from the URL (access_token)
    const hash = window.location.hash
    let token = window.localStorage.getItem("token") // localstorage: gets data from the browser to get data

    // If we dont have a token and have a hash, we have to get our token
    if (!token && hash) {
      // Remove hashtag from the begiining and split string from "&" and "=" (from browser) to get access_token from browser
      // we get an array so we need "find"
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]
      console.log(token)

      // Clear the hash
      window.location.hash = ""

      // Set the token
      window.localStorage.setItem("token", token) 
    }
      setToken(token)
  }, [])

  // Sign out from Spotify by clearing the token
  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  // Search for artists and also pass the event
  // Does http requests - async because we are waiting for axios
  const searchArtists = async (e) => {

    // Avoid reloading of page because React does that every time you submit a form
    e.preventDefault()

    // If a selected artist is known, clear. Do you want this?
    // @TODO: TEST with wiki
    /*
    if(selectedArtist) {
      setSelectedArtist("");
    }
    */

    // Get the data from Spotify
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

  // Test function to not doing to many calls to the Spotify API
  // Will be removed later 
  const test = () => { 
    setSelectedArtist("Metallica");
  }

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

        {/* Test button to test the APIs
            @TODO: Should be removed later*/}
        <button onClick={() => test()} style={{marginTop: "200px"}}>Test</button>

        {/* Sign in/Sign out section
          If we dont have a token, render login button, otherwise log out*/}

        <div id="authContainer">
          <img id="spotifylogo" src={spotifyLogo} alt="Logo"/>
          {! token ?
          <a id="signinbutton" href={`${AUTH_ENDPOINT}?client_id=${SPOTIFY_CLIENT_ID}&redirect_uri=${SPOTIFY_REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>
            Sign in with Spotify</a>
          :
          <div>
            <p>You are signed in</p> 
            <button id="signoutbutton" onClick={logout}>Sign out</button>
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
          <p className="smallTitle">Sign in with Spotify to search for artists</p>
        </form> 
      }
      </div>

      {/* Render artists/songs*/}
      <div id="artistSongsContainer">
        {renderArtists()}
      </div>

      {/* Information about the artist from the Wikipedia API
        Different information is shown to the user based on if the user is signed in and
        has selected an artist.*/}
      <div id="infoContainer">
        {!token ? 
          <p><p className="smallTitle">Information about the artist</p>
              Sign in with Spotify, search for artists to 
              get information about the artist.</p>
        : !selectedArtist ?
          <p><p className="smallTitle">Information about the artist</p>
            Search for an artist. Then select it to show information about 
            the artist.</p>
            : <p><p className="smallTitle">Information regarding {selectedArtist}</p>

            <div className="results">
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
              </p>
          }
      </div>

      {/* Discussion about the artist with Disqus */}
      <div id="discussContainer">
        <p className="smallTitle">Discuss about artists</p>
        <DiscussionEmbed className="prutt"
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
