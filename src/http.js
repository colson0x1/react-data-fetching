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
