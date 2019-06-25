import React from "react";
import ReactDOM from "react-dom";
// import { render } from "react-dom";
import ReactTable from "react-table";
import "react-table/react-table.css";
import Select from "react-select";

import "./styles.css";

let JWT = null;

function checkReg(){
  const regEmail = document.getElementById("regemail").value;
  const regPass = document.getElementById("psw").value;
  const con_regPass = document.getElementById("pswcon").value;

  if(regPass === con_regPass){
    fetch("https://cab230.hackhouse.sh/register", {
      method: "POST",
      body: 'email='.concat(encodeURIComponent(regEmail), '&password=', regPass),
      headers: {
        "Content-type": "application/x-www-form-urlencoded"
      }
    })
      .then(function(response) {
        if (response.ok) {
          return response.json();
        }
        return response.json();
      })
      .then(function(result) {
        let regBtn = document.getElementById("regBtn");
        alert(JSON.stringify(result));
        if(JSON.stringify(result) === "{\"message\":\"yay! you've successfully registered your user account :)\"}"){
          regBtn.disabled = true;
          let regBox = document.getElementById("form-popup");

          regBox.style.display = "none";
          console.log(regBtn.disabled);
        }
      })
      .catch(function(error) {
        console.log("There has been a problem with your fetch operation: ",error.message);
      });
  }
  else{
    alert("Passwords do not match!");
  }
}

function checkLogin() {
  const userEmail = document.getElementById("email").value;
  const userPass = document.getElementById("pass").value;

  fetch("https://cab230.hackhouse.sh/login", {
    method: "POST",
    body: "email=".concat(
      encodeURIComponent(userEmail),
      "&password=",
      userPass
    ),
    headers: {
      "Content-type": "application/x-www-form-urlencoded"
    }
  })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      return response.json();
    })
    .then(function(result) {
      alert(JSON.stringify(result));
      JWT = result.token;
      console.log(JWT);
      if(JWT != null){
        let loginBox = document.getElementById("login-div");
        loginBox.style.display = "none";
      }
    });
}

class App extends React.Component {

  constructor() {
    super();
    this.state = {
      showTable: false,
      showRegister: false,
      loggedIn: false,
      offences: [],
      offencesDropdown: [],
    };
  }

  componentDidMount(){
    fetch("https://cab230.hackhouse.sh/offences")
      .then(response => response.json())
      .then(data => {
        this.setState({offences: data.offences})
        console.log(data.offences);
        let offencesFromAPI = data.offences.map(offence => { return {label: offence, display: offence} });
        this.setState({offencesDropdown: offencesFromAPI});
      })
  }

  _showTable = bool => {
    this.setState({
      showTable: bool
    });
  };

  _showRegister = bool => {
    this.setState({
      showRegister: bool
    })
  }

  _loggedIn = bool => {
    this.setState({
      loggedIn: bool
    })
  }

  render() {
    const {offences} = this.state.offences;
    const {offencesDropdown} = this.state.offencesDropdown;
    const data = JSON.stringify(offences);

    console.log(offences);
    console.log(data);

    return (
      <div className="App">
        <header>
          <div id="title">
            <h2 id="site_title">QLD Offence Information</h2>
          </div>

          <div id="login-div">
            <form>
              <input id="email" type="text" placeholder="Email" />
              <input id="pass" type="password" placeholder="Password" />
              <button type="button" id="regBtn" onClick={this._showRegister.bind(null, true)}>
                Register
              </button>
              <button type="button" id="logBtn" onClick={checkLogin}>
                Login
              </button>
            </form>

            {this.state.showRegister && (
              <div id="form-popup">
                <form id="form-container">
                  <h3>Register</h3>

                  <label id="email"><b>Email</b></label>
                  <input type="text" placeholder="Enter Email" id="regemail" required />

                  <label id="pswL"><b>Password</b></label>
                  <input type="password" placeholder="Enter Password" id="psw" required />

                  <label id="pswconL"><b>Confirm Password</b></label>
                  <input type="password" placeholder="Confirm Password" id="pswcon" required />

                  <button type="button" id="btn submit" onClick={checkReg}>Register</button>
                  <button type="button" id="btn cancel" onClick={this._showRegister.bind(null, false)}>Close</button>
                </form>
              </div>
            )}


          </div>
        </header>

        <div id="info">
          <h2>Offences</h2>
          <p>
            The button below will provide a list of all offences,
            <br /> and is accessible without authentication.
          </p>
          <button id="listOffence" onClick={this._showTable.bind(null, true)}>
            List Offences
          </button>
          <br />
          {this.state.showTable && (
            <div id="offences">
              <br />
              <ReactTable
                data={data}
                columns={[
                  {
                    Header: "Offences",
                    accessor: ""
                  }
                ]}
              />
            </div>
          )}
        </div>

        <div id="search">
          <h2>Search Offences</h2>
          <p>
            The filters below will allow you to search
            <br /> for more specific information.
          </p>

          <div id="filters">
            <form id="filterForm">
        			<Select options={offencesDropdown} placeholder="Choose an Offence" width="300px"></Select>

    				</form><br />
          </div>

          <button id="searchBtn" onClick= {this.goSearch}>Search Offences</button>
          <br />
          <br />
          <br />
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
