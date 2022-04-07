import React, { useState } from "react";
import { AuthenticatedTemplate, UnauthenticatedTemplate, useMsal } from "@azure/msal-react";
import { loginRequest } from "./authConfig";
import { PageLayout } from "./components/PageLayout";
import { ProfileData } from "./components/ProfileData";
import { callMsGraph } from "./graph";
import Button from "react-bootstrap/Button";
import "./styles/App.css";

/**
 * Renders information about the signed-in user or a button to retrieve data about the user
 */
const ProfileContent = () => {
    const { instance, accounts } = useMsal();
    const [graphData, setGraphData] = useState(null);
    const [activationResponse, setActivationResponse] = useState(null);
    const [token, setToken] = useState(null);
    const [input, setInput] = useState('');

    function RequestProfileData() {
        // Silently acquires an access token which is then attached to a request for MS Graph data
        instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0]
        }).then((response) => {
            debugger
            callMsGraph(response.accessToken).then(response => setGraphData(response));
        });
    }

    function activatePurchase(accessToken) {
        const resolveUrl = "https://marketplaceapi.microsoft.com/api/saas/subscriptions/resolve?api-version=2018-08-31";
        const headers = new Headers();
        const bearer = `Bearer ${accessToken}`;

        headers.append("Authorization", bearer);
        headers.append("x-ms-marketplace-token", input);

        const options = {
            method: "POST",
            headers: headers
        };

        debugger

        return fetch(resolveUrl, options)
            .then(response => response.json())
            .catch(error => console.log(error));
    }

    function activatePurchaseFromMonet(accessToken) {
        const resolveUrl = "http://minint-etcbjf5:8854/api/v1.0/Offers/confluentinc.confluent-enterprise";
        const headers = new Headers();
        const bearer = `Bearer ${accessToken}`;

        headers.append("Authorization", bearer);

        const options = {
            method: "GET",
            headers: headers
        };

        debugger

        return fetch(resolveUrl, options)
            .then(response => response.json())
            .catch(error => console.log(error));
    }

    function RequestActivation() {
        // Silently acquires an access token which is then attached to a request for MS Graph data
        instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0]
        }).then((response) => {
            debugger
            activatePurchaseFromMonet(response.accessToken).then(response => setActivationResponse(response));
        });
    }

    function fetchToken() {
        // Silently acquires an access token which is then attached to a request for MS Graph data
        const param = {
            ...loginRequest,
            account: accounts[0]
        };
        instance.acquireTokenSilent(param).then((response) => {
            debugger
            setToken(response.accessToken);
        });
    }

    return (
        <>
            <h5 className="card-title">Welcome {accounts[0].name}</h5>
            {graphData ?
                <ProfileData graphData={graphData} />
                :
                <Button variant="secondary" onClick={fetchToken}>Fetch token</Button>
            }
            {/* <input value={input} onInput={e => setInput(e.target.value)}/> */}
            <Button variant="secondary" onClick={RequestActivation}>Activate</Button>
            {activationResponse}
        </>
    );
};

/**
 * If a user is authenticated the ProfileContent component above is rendered. Otherwise a message indicating a user is not authenticated is rendered.
 */
const MainContent = () => {
    return (
        <div className="App">
            <AuthenticatedTemplate>
                <ProfileContent />
            </AuthenticatedTemplate>

            <UnauthenticatedTemplate>
                <h5 className="card-title">Please sign-in to see your profile information.</h5>
            </UnauthenticatedTemplate>
        </div>
    );
};

export default function App() {
    return (
        <PageLayout>
            <MainContent />
        </PageLayout>
    );
}
