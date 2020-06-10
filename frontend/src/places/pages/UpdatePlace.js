import React, { useState, useEffect ,useContext} from "react";
import { useParams ,useHistory} from "react-router-dom";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import { useForm } from "../../shared/hooks/form-hook";
import Card from "../../shared/components/UIElements/Card";
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH,
} from "../../shared/util/validator";
import { useHttpClient } from "../../shared/hooks/http-hook";
import { AuthContext } from '../../shared/context/auth-context';
import "./PlaceForm.css";

const UpdatePlace = (props) => {
  const auth = useContext(AuthContext);
  //const [isLoading, setIsLoading] = useState(true);
  const placeId = useParams().placeId;
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedPlaces, setLoadedPlaces] = useState();
  const history = useHistory();
  const [formState, inputHandler, setFormData] = useForm(
    {
      title: {
        value: "",
        isValid: false,
      },
      description: {
        value: "",
        isValid: false,
      },
    },
    false
  );
  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/places/${placeId}`
        );
        setLoadedPlaces(responseData.place);
        setFormData(
          {
            title: {
              value: responseData.place.title,
              isValid: true,
            },
            description: {
              value: responseData.place.description,
              isValid: true,
            },
          },
          true
        );
      } catch (error) {}
    };
    fetchPlaces();
  }, [sendRequest, placeId, setFormData]);

  const placeUpdateSubmitHandler = async event => {
    event.preventDefault();
    try {
      await sendRequest(
        `http://localhost:5000/api/places/${placeId}`,
        'PATCH',
        JSON.stringify({
          title: formState.inputs.title.value,
          description: formState.inputs.description.value
        }),
        {
          'Content-Type': 'application/json',
          Authorization:'Bearer '+ auth.token
        }
      );
      history.push('/' + auth.userId + '/places');
    } catch (err) {}
  };
  if (isLoading) {
    return (
      <div className="center">
        <h2>
          <LoadingSpinner asOverlay></LoadingSpinner>
        </h2>
      </div>
    );
  }
  if (!loadedPlaces && error) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find Place</h2>
        </Card>
      </div>
    );
  }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {!isLoading && loadedPlaces && (<form className="place-form" onSubmit={placeUpdateSubmitHandler}>
        <Input
          id="title"
          element="input"
          label="Title"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Place enter the valid Title."
          onInput={inputHandler}
          initialValue={loadedPlaces.title}
          initialValid={true}
        ></Input>
        <Input
          id="description"
          element="textarea"
          label="Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Place enter the valid desciption."
          onInput={inputHandler}
          initialValue={loadedPlaces.description}
          initialValid={true}
        ></Input>
        <Button type="submit" disabled={!formState.isValid}>
          Update Place
        </Button>
      </form>) }
    </React.Fragment>
  );
};

export default UpdatePlace;
