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
  // Spotify variables to set access token (from central account) and search results
  const token = "BQBsirDrpBzv7h2tyFBFWx5hw2VZJU9azk_nwrib26e77MjbeosifjzrW9ljjS2Y4BxBSKRpRQyzknl3NGy9ED23NNihDq0smwKKApdhAxSAj0oOy1CInx6_aH2v5qOBCveOXlagBi7dfK7OER5aoog28kEcfU8kE14iDNfHqfbw8sHQDceE2-x7vwjceixan5Y"
  const [searchKey, setSearchKey] = useState("")
  const [artists, setArtists] = useState([])

  // To get information about a selected artist
  const [selectedArtist, setSelectedArtist] = useState("")

  // Wikipedia results based on a selected artist
  const [wikiResults, setWikiResults] = useState([]);

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
    handleWikiInfo(selectedArtist);
  }, [selectedArtist])

  // Handle information from Wikipedia
  // Inspiration from: https://www.youtube.com/watch?v=Gyg5R8Sfo1U
  const handleWikiInfo = async (selected_Artist) => { 

    // Do a call to the Wikipedia API with various parameters, ex. categories
    const endpoint = `https://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srlimit=2&tllimit=500&srsearch=${selected_Artist}+incategory:Living_people|Music|Musicians|Singers|People|Singing|Dance_musicians|Singers_by_nationality|Songs_by_artist|Grammy_Award_winners`;

    // Fetch response
    const response = await fetch(endpoint);
    
    // Check for errors and throw a error in case of errors
    if (!response.ok) {
      throw Error(response.statusText);
    }

    // Call for json to get the data from the response
    const jsons = await response.json();

    // Set the result from the json object
    setWikiResults(jsons.query.search);
  }

  // HTML rendering
  return (
    <div className="App">
      <header className="App-header">
        <div id="titleContainer">
          <h1 id="Apptitle">Find artists, information, and discuss</h1>
        </div>

        {/* Show Spotify logo according to their guidelines */}
        <div id="authContainer">
          <p id="supporttext">This app is supported by</p> 
          <img id="spotifylogo" src={spotifyLogo} alt="Logo"/>
        </div>
    
        {/* Search for artist section */}
        <div id="searchContainer">
          <form id="searchField" onSubmit={searchArtists}>
            <input type="text" onChange={e => setSearchKey(e.target.value)}/>
            <button className="searchButton" type={"submit"}>Search</button>
        </form> 
      </div>

      {/* Render a list of artists */}
      <div id="artistSongsContainer">
      {renderArtists()}
      </div>

      {/* Information about the artist from the Wikipedia API
        Different information is shown to the user based on if the user has selected an artist. */}
      <div id="infoContainer">
        { !selectedArtist ?
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
