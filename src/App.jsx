import { useRef, useState, useCallback, useEffect } from 'react';

import Places from './components/Places.jsx';
import Modal from './components/Modal.jsx';
import DeleteConfirmation from './components/DeleteConfirmation.jsx';
import logoImg from './assets/logo.png';
import AvailablePlaces from './components/AvailablePlaces.jsx';
import { fetchUserPlaces, updateUserPlaces } from './http.js';
import Error from './components/Error.jsx';

function App() {
  const selectedPlace = useRef();

  const [userPlaces, setUserPlaces] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState();

  const [errorUpdatingPlaces, setErrorUpdatingPlaces] = useState();

  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    async function fetchPlaces() {
      setIsFetching(true);
      try {
        const places = await fetchUserPlaces();
        setUserPlaces(places);
      } catch (error) {
        setError({ message: error.message || 'Failed to fetch user places.' });
      }

      setIsFetching(false);
    }

    fetchPlaces();
  }, []);

  function handleStartRemovePlace(place) {
    setModalIsOpen(true);
    selectedPlace.current = place;
  }

  function handleStopRemovePlace() {
    setModalIsOpen(false);
  }

  async function handleSelectPlace(selectedPlace) {
    // alternative way is to put await in here and show the loading spinner
    // during that await
    /* await updateUserPlaces([selectedPlace, ...userPlaces]); */
    // doing that above, now this state update below will wait until that request
    // is done. so we should be showing some loading text or spinner, otherwise
    // it might seem to the user as if the application is stuck

    setUserPlaces((prevPickedPlaces) => {
      if (!prevPickedPlaces) {
        prevPickedPlaces = [];
      }
      if (prevPickedPlaces.some((place) => place.id === selectedPlace.id)) {
        return prevPickedPlaces;
      }
      return [selectedPlace, ...prevPickedPlaces];
    });

    // here we don't wanna just update the state but also send our updated
    // array of places to our backend
    // we're using after updating the state inside this handleSelectPlace func
    // here, state update is not  immediately available in this next line of code
    // instead it will only be available after the component function executed
    // the next time which is scheduled by this state update there (setUserPlaces)
    // but this code updateUserPlaces(userPlaces) will still execute before that
    // happened because its part of that old component function so to say
    // before it was updated.
    // So just using our old state (userPlaces) won't work here, instead we should
    // use our old state and extract the old user places into new array, add the
    // newly selected place in that new array!!
    /* updateUserPlaces(userPlaces); // WRONG way */
    // RIGHT WAY
    // and this will send this updated array of data to our backend
    // this operation might take sometime therefore we want to await it before
    // we continue with the next steps. but await only works in functions that
    // are decorated in async.
    // Great thing is, this function handleSelecePlace can be decorated with async
    // because all we're doing with this function is we're setting it up as
    // an event listener function in the end, thats triggered whenever we select a place.
    // when using async await we can also use try catch to wrap this code which might
    // fail to catch potential errors. so then there after, we can also define some
    // code that should be executed if this should fail.
    try {
      // optimistic update
      await updateUserPlaces([selectedPlace, ...userPlaces]);
    } catch (error) {
      // we aren't using the function form to update state here because we
      // want that old user places state that will not include the newly
      // selected place
      // here if smth goes wrong, we roll back that change and we update that
      // ui again
      setUserPlaces(userPlaces);
      setErrorUpdatingPlaces({
        message: error.message || 'Failed to update places.',
      });
    }
  }

  const handleRemovePlace = useCallback(
    async function handleRemovePlace() {
      setUserPlaces((prevPickedPlaces) =>
        prevPickedPlaces.filter(
          (place) => place.id !== selectedPlace.current.id,
        ),
      );

      try {
        // performing optimistic updating means first updating the state and
        // then sending an http requests
        await updateUserPlaces(
          userPlaces.filter((place) => place.id !== selectedPlace.current.id),
        );

        setModalIsOpen(false);
      } catch (error) {
        setUserPlaces(userPlaces);
        setErrorUpdatingPlaces({
          message: error.message || 'Failed to delete place.',
        });
      }
    },
    [userPlaces],
  );

  function handleError() {
    setErrorUpdatingPlaces(null);
  }

  return (
    <>
      <Modal open={errorUpdatingPlaces} onClose={handleError}>
        {errorUpdatingPlaces && (
          <Error
            title='An error occurred!'
            message={errorUpdatingPlaces.message}
            onConfirm={handleError}
          />
        )}
      </Modal>

      <Modal open={modalIsOpen} onClose={handleStopRemovePlace}>
        <DeleteConfirmation
          onCancel={handleStopRemovePlace}
          onConfirm={handleRemovePlace}
        />
      </Modal>

      <header>
        <img src={logoImg} alt='Stylized globe' />
        <h1>DESTINATION DREAM</h1>
        <p>
          Create your personal collection of places you would like to visit or
          you have visited.
        </p>
      </header>
      <main>
        {error && <Error title='An error occurred!' message={error.message} />}
        {!error && (
          <Places
            title="I'd like to visit ..."
            fallbackText='Select the places you would like to visit below.'
            isLoading={isFetching}
            loadingText='Fetching your places...'
            places={userPlaces}
            onSelectPlace={handleStartRemovePlace}
          />
        )}

        <AvailablePlaces onSelectPlace={handleSelectPlace} />
      </main>
    </>
  );
}

export default App;
