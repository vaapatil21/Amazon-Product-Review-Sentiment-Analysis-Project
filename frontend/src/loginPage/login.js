import { Authenticator, Heading } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const LoginPage = () => {
  const nav = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="login-page flex flex-col justify-center items-center h-screen">
      {!isLoading && (
        <>
          <Heading level={1} className="heading">Amazon Product Sentiment</Heading>
          <h1 className="sub-heading"> Hey, good to see you! </h1>
          {/* <h2 className="sub-heading"> Log in to get going.</h2> */}
        </>
      )}

      <Authenticator>
      
        {({ signOut, user }) => {
          if (user) {
            setIsLoading(true);
            localStorage.setItem("userId", user.userId);
            nav("/categories", { user });
            {
              user && <button onClick={signOut}>Sign Out</button>;
            }
          }
        }}
      </Authenticator>
    </div>
  );
};

export default LoginPage;
