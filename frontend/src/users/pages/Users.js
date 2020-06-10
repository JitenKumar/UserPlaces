import React, { useEffect, useState } from "react";
import UsersLists from "../components/UsersList";
import { useHttpClient } from "../../shared/hooks/http-hook";
import LoadingSpinner from "../../shared/components/UIElements/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElements/ErrorModal";
const Users = (props) => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedUsers, setLoadedUsers] = useState();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const responseData = await sendRequest(
          "http://localhost:5000/api/users"
        );
        setLoadedUsers(responseData.users);
      } catch (err) {}
    };
    fetchUsers();
  }, [sendRequest]);
  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError}></ErrorModal>
      {isLoading && <div className="center">{<LoadingSpinner asOverlay />}</div>}
      {!isLoading && loadedUsers && (
        <UsersLists items={loadedUsers}></UsersLists>
      )}
    </React.Fragment>
  );
};

export default Users;
