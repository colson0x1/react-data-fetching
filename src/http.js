export async function fetchAvailablePlaces() {
  // place the data fetching code

  const response = await fetch('http://localhost:3000/places');
  const resData = await response.json();

  if (!response.ok) {
    throw new Error('Failed to fetch places');
  }

  // after we checked the response is correct, i.e if we didn't throw an error then
  return resData.places;
}

export async function fetchUserPlaces() {
  // place the data fetching code

  const response = await fetch('http://localhost:3000/user-places');
  const resData = await response.json();

  if (!response.ok) {
    throw new Error('Failed to fetch user places');
  }

  // after we checked the response is correct, i.e if we didn't throw an error then
  return resData.places;
}

export async function updateUserPlaces(places) {
  const response = await fetch('http://localhost:3000/user-places', {
    method: 'PUT',
    body: JSON.stringify({ places }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // now look at the response and parse it
  // .json() also returns promise so we await it
  const resData = await response.json();

  // if we got error status code
  if (!response.ok) {
    throw new Error('Failed to update user data.');
  }

  return resData.message;
}
