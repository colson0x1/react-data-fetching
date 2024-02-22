import { useEffect, useState } from 'react';

import Places from './Places.jsx';
import Error from './Error.jsx';
import { sortPlacesByDistance } from '../loc.js';
import { fetchAvailablePlaces } from '../http.js';

export default function AvailablePlaces({ onSelectPlace }) {
  // when fetching data, its super common to have these three pieces of state
  // work together i.e isFetching, data, error
  const [isFetching, setIsFetching] = useState(false);
  const [availablePlaces, setAvailablePlaces] = useState([]);
  const [error, setError] = useState();

  useEffect(() => {
    async function fetchPlaces() {
      setIsFetching(true);

      // using try catch allows us to stop the application from crashing
      // try block - add the code that might fail
      try {
        // we use the utility fetch func here because fetch funtion may
        // throw an error, either because we throw it or because fetch function
        // throws one
        // so we execute here and still await it because fetchAvailablePlaces
        // will return a promise
        // every function we decorate with async yields a promise
        const places = await fetchAvailablePlaces();

        // Fetch user location in the browser.
        // Position is not available instantly, it takes some time.
        // Can't use asyn/await in getCurrentPosition because getCurrentPosition
        // doesn't yield a promise.
        // So therefore, getCurrentPisition takes a callback function which will be
        // executed eventually
        // by the browser in the future once the position has been fetched.
        // So we're using callback pattern in getCurrentPosition.
        // This function which will be executed by the browser once the data is there
        // will then receives a position object that contains the users coordinates.
        //
        navigator.geolocation.getCurrentPosition((position) => {
          // if we make it to this end, we know that resData exists
          // we can sort the location using our utility func
          const sortedPlaces = sortPlacesByDistance(
            places,
            position.coords.latitude,
            position.coords.longitude,
          );

          setAvailablePlaces(sortedPlaces);

          // this should stay outside of the try catch block typically because we
          // wanna end this loading state no matter if we got an error or not
          // put setIsFetching places here if we're done fetching and sorting our palces
          setIsFetching(false);
        });
      } catch (error) {
        // catch block - define code that should be executed if an error was encountered
        // Handling the error in a react application typically means we wanna
        // update the UI and show the error message to the user
        setError({
          message:
            error.message || 'Could not fetch places, please try again later.',
        });

        // also put setIsFetching here if we have an error
        setIsFetching(false);
      }
    }

    fetchPlaces();
  }, []);

  if (error) {
    return <Error title='An error occurred!' message={error.message} />;
  }

  return (
    <Places
      title='Available Places'
      places={availablePlaces}
      isLoading={isFetching}
      loadingText='Fetching place data.'
      fallbackText='No places available.'
      onSelectPlace={onSelectPlace}
    />
  );
}
