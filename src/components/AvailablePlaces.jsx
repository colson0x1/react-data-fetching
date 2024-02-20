import { useEffect, useState } from 'react';

import Places from './Places.jsx';
import Error from './Error.jsx';

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
        const response = await fetch('http://localhost:3000/places');
        const resData = await response.json();

        if (!response.ok) {
          throw new Error('Failed to fetch places');
        }

        // if we make it to this end, we know that resData exists
        setAvailablePlaces(resData.places);
      } catch (error) {
        // catch block - define code that should be executed if an error was encountered
        // Handling the error in a react application typically means we wanna
        // update the UI and show the error message to the user
        setError({
          message:
            error.message || 'Could not fetch places, please try again later.',
        });
      }

      // this should stay outside of the try catch block typically because we
      // wanna end this loading state no matter if we got an error or not
      setIsFetching(false);
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
