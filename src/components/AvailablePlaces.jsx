import { useState } from 'react';

import Places from './Places.jsx';

export default function AvailablePlaces({ onSelectPlace }) {
  const [availablePlaces, setAvailablePlaces] = useState([]);

  // wrong way to fetch. this creates an infinite loop
  // when called fetch like this directly in the component function
  // this fetch block will be executed everytime the component function executes
  // and therefore new requests would be sent whenever this component function executes
  // the problem is in the second event block we update the state which causes
  // the component function to execute again, so we would end up with a new request,
  // a new state update and a new execution, new request, state update and so on
  fetch('http://localhost:3000')
    .then((response) => {
      return response.json();
    })
    .then((resData) => {
      setAvailablePlaces(resData.places);
    });

  return (
    <Places
      title='Available Places'
      places={availablePlaces}
      fallbackText='No places available.'
      onSelectPlace={onSelectPlace}
    />
  );
}
