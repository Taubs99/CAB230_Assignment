import React from "react";
import ReactDOM from "react-dom";
// import { render } from "react-dom";
import ReactTable from "react-table";
import "react-table/react-table.css";
import Select from "react-select";
import {Bar} from 'react-chartjs-2';
import GoogleMapReact from "google-map-react";

import "./styles.css";

let JWT = null;

let serverURL = "https://cab230.hackhouse.sh/";

let sOffence = null;
let searchResults1 = [];
let chartResults = {};
let heatMapData = {
  positions: [],
  options: {
    radius: 30,
    opacity: 0.6,
  }
}

let searchStr = ""

let chartX = [];
let chartY = [];

let searchList = {"area":null, "age":null, "gender":null, "year":null}

function checkReg(){
  const regEmail = document.getElementById("regemail").value;
  const regPass = document.getElementById("psw").value;
  const con_regPass = document.getElementById("pswcon").value;

  if(regPass === con_regPass){
    fetch(serverURL + "register", {
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

  fetch(serverURL + "login", {
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
      if(JWT != null){
        let loginBox = document.getElementById("login-div");
        let logoutBox = document.getElementById("logout-div");
        let emailBox = document.getElementById("email");
        let pwdBox = document.getElementById("pass");
        loginBox.style.display = "none";
        logoutBox.style.display = "block";
        emailBox.value = "";
        pwdBox.value = "";
      }
    });
}

function logOut(){
  JWT = null;
  const loginDiv = document.getElementById("login-div");
  const logoutBox = document.getElementById("logout-div");
  const regBtn = document.getElementById("regBtn");

  regBtn.disabled = false;
  loginDiv.style.display = "block";
  logoutBox.style.display = "none";
}

const requestData = async() =>{

  await goSearch();

  return new Promise((resolve) => {
    const res = {
      fData: searchResults1,
    }
    resolve(res.fData);
  })
}

const goSearch = async() => {
  if(JWT != null){
    const baseUrl = serverURL + "search?offence=";
    let filter = ""
    if(sOffence == null){
      alert("Offence Required!");
    }
    else{
      filter += sOffence;
      searchStr += "Offence: " + sOffence;
      if(searchList.area != null){
        filter += "&area=";
        if(searchList.area.length > 1){
          for(let x = 0; x < searchList.area.length - 1; x++){
            filter += searchList.area[x].label + ",";
          }
          filter += searchList.area[searchList.area.length - 1].label;
        }
        else {
          filter += searchList.area[0].label;
        }
      }
      if(searchList.age != null){
        filter += "&age=";
        if(searchList.age.length > 1){
          for(let x = 0; x < searchList.age.length - 1; x++){
            filter += searchList.age[x].label + ",";
          }
          filter += searchList.age[searchList.age.length - 1].label;
        }
        else filter += searchList.age[0].label;
      }
      if(searchList.gender != null){
        filter += "&gender=";
        if(searchList.gender.length > 1){
          for(let x = 0; x < searchList.gender.length - 1; x++){
            filter += searchList.gender[x].label + ",";
          }
          filter += searchList.gender[searchList.gender.length - 1].label;
        }
        else filter += searchList.gender[0].label;
      }

      if(searchList.year != null){
        filter += "&year=";
        if(searchList.year.length > 1){
          for(let x = 0; x < searchList.year.length - 1; x++){
            filter += searchList.year[x].label + ",";
          }
          filter += searchList.year[searchList.year.length - 1].label;
        }
        else filter += searchList.year[0].label;
      }
    const query = baseUrl + filter;
    let getParam = { method: "GET" };
    let head = { Authorization: `Bearer ${JWT}` };
    getParam.headers = head;

    await fetch(encodeURI(query),getParam)
        .then(function(response) {
            if (response.ok) {
                return response.json();
            }
            return response.json();
        })
        .then(function(result) {
            console.log(JSON.stringify(result))
            searchResults1 = result.result.filter(function(results){
              return results.total !== 0;
            });
            if(JWT == null){
              console.log("Not authorized");
            }
        })
        .catch(function(error) {
            console.log("There has been a problem with your fetch operation: ",error.message);
        });
    }
  }
  else{
    alert("Not authorized!");
  }
}

const requestChart = async() =>{

  await getChartData();
  return new Promise((resolve) => {
    const res = {
      fData: chartResults,
    }
    resolve(res.fData);
  })
}

function getChartData(){
  let xAxis = searchResults1;
  let xAxisF = [];
  for(let x = 0; x <= xAxis.length - 1; x++){
    xAxisF.push(xAxis[x].LGA);
  }
  chartX = xAxisF;

  let yAxis = searchResults1;
  let yAxisF = [];
  for(let x = 0; x <= yAxis.length - 1; x++){
    yAxisF.push(yAxis[x].total);
  }
  chartY = yAxisF;
}

const requestMap = async() =>{
  await getMapData();
  return new Promise((resolve) => {
    const res = {
      fData: 1,
    }
    resolve(res.fData);
  })
}

function getMapData(){
  heatMapData.positions = searchResults1.map((coord, index) => {
    const pos = {
      lat: coord.lat,
      lng: coord.lng,
      weight: coord.total
    }
    return (
      pos
    )
  })
}

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      showTable: false,
      showRegister: false,
      showSearch: false,
      showChart: false,
      showMap: false,
      loggedIn: false,
      offences: [],
      data: [],
      chartData: {},
      mapData: {},
      yearValue: [],
      selectedOffence: null,
      loading: true,
    };
    this.fetchData = this.fetchData.bind(this);
    this.clearSearch = this.clearSearch.bind(this);
    this.handleYearNew = this.handleYearNew.bind(this);
    this.handleGenderNew = this.handleGenderNew.bind(this);
    this.handleAgeNew = this.handleAgeNew.bind(this);
    this.handleAreaNew = this.handleAreaNew.bind(this);
  }

  static defaultProps = {
    center: {
      lat: -22.439306,
      lng: 144.271722
    },
    zoom: 5
  };

  fetchData = async(state, instance)=>{
    this.setState({loading: true});
    await requestData().then(
      res => {
        this.setState({
          data: searchResults1,
          loading: false,
        })
      }
    )

    await requestChart().then(
      this.setState({
        chartData: {
                      labels: chartX,
                      datasets: [
                        {
                        label: sOffence,
                        backgroundColor: 'rgba(75,192,192,0.4)',
                        data: chartY,
                        }
                      ]
                    },
      })
    )

    await requestMap();
  }

  handleOffence = selectedOffence => {
    this.setState({selectedOffence});
    if(selectedOffence != null){
      sOffence = selectedOffence.value;
    }
    else{
      sOffence = null;
    }
  }

  handleAreaNew(areaValue) {
    this.setState({areaValue});
    if(areaValue != null){
      searchList.area = areaValue;
    }
    else searchList.area = null;
  }

  handleAgeNew(ageValue) {
    this.setState({ageValue});
    if(ageValue != null){
      searchList.age = ageValue;
    }
    else searchList.age = null;
  }

  handleGenderNew(genderValue) {
    this.setState({genderValue});
    if(genderValue != null){
      searchList.gender = genderValue;
    }
    else searchList.gender = null;
  }

  handleYearNew(yearValue) {
    this.setState({yearValue});
    if(yearValue != null){
      searchList.year = yearValue;
    }
    else searchList.year = null;
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

  _showSearch = bool => {
    this.setState({
      showSearch: bool
    })
  }

  _showChart = bool => {
    this.setState({
      showChart: bool
    })
  }

  _showMap = bool => {
    this.setState({
      showMap: bool
    })
  }

  _loggedIn = bool => {
    this.setState({
      loggedIn: bool
    })
  }

  componentDidMount(){
    fetch(serverURL + "offences")
      .then(response => response.json())
      .then(data => {
        this.setState({offences: data.offences});
        let offencesFromAPI = data.offences.map(offence => { return {label: offence, value: offence} });
        this.setState({offencesDropdown: offencesFromAPI});
      })

    fetch(serverURL + "areas")
      .then(response => response.json())
      .then(data => {
        let areasFromAPI = data.areas.map(area => { return {label: area, value: area} });
        this.setState({areasDropdown: areasFromAPI});
      })

    fetch(serverURL + "ages")
      .then(response => response.json())
      .then(data => {
        let agesFromAPI = data.ages.map(age => { return {label: age, value: age} });
        this.setState({agesDropdown: agesFromAPI});
      })


    fetch(serverURL + "genders")
      .then(response => response.json())
      .then(data => {
        let gendersFromAPI = data.genders.map(gender => { return {label: gender, value: gender} });
        this.setState({gendersDropdown: gendersFromAPI});
      })

    fetch(serverURL + "years")
      .then(response => response.json())
      .then(data => {
        let yearsFromAPI = data.years.map(year => { return {label: year, value: year} });
        this.setState({yearsDropdown: yearsFromAPI});
      })
  }

  clearSearch(){
    this.setState(state => ({
      showSearch: false,
      showChart: false,
      showMap: false,
      selectedOffence: null,
      areaValue: null,
      ageValue: null,
      genderValue: null,
      yearValue: null,
    }));
    searchList.area = null;
    searchList.age = null;
    searchList.gender = null;
    searchList.year = null;
    searchStr = "";
  }

  render() {
    const {offences} = this.state;
    let {data, loading} = this.state;
    let {offencesDropdown} = this.state;
    let {areasDropdown} = this.state;
    let {agesDropdown} = this.state;
    let {gendersDropdown} = this.state;
    let {yearsDropdown} = this.state;
    const {chartData} = this.state;

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

          <div id="logout-div">
            <form>
              <button type="button" id="outBtn" onClick={logOut}>Logout</button>
            </form>
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
                data={offences}
                columns={[
                  {
                    Header: "Offences",
                    accessor: ""
                  }
                ]}
                defaultPageSize={10}
              />
            </div>
          )}
        </div>
        <div id="search">
          <h2>Search Offences</h2>
          <p>
            The filters below will allow you to search
            <br /> for more specific information.
            <br /> MUST BE LOGGED IN - OFFENCE IS REQUIRED
          </p>
          {!(this.state.showSearch) && (
            <div id="filters">
        			<Select id="offDrop" isClearable={false} value={this.state.selectedOffence} onChange={this.handleOffence} options={offencesDropdown} placeholder="Please Choose an Offence"></Select>
        			<Select isMulti id="areaDrop" isClearable={false} value={this.state.areaValue} onChange={this.handleAreaNew} options={areasDropdown} placeholder="Please Choose an Area"></Select>
        			<Select isMulti id="ageDrop" isClearable={false} value={this.state.ageValue} onChange={this.handleAgeNew} options={agesDropdown} placeholder="Please Choose an Age"></Select>
              <Select isMulti id="gendDrop" isClearable={false} value={this.state.genderValue} onChange={this.handleGenderNew} options={gendersDropdown} placeholder="Please Choose a Gender"></Select>
        			<Select isMulti id="yearDrop" isClearable={false} value={this.state.yearValue} onChange={this.handleYearNew} options={yearsDropdown} placeholder="Please Choose a Year" className="basic-multi-select" classNamePrefix="select"></Select>
            </div>
          )
        }
          {!(this.state.showSearch) && (
            <button id="searchBtn" disabled= {(this.state.selectedOffence == null) || (JWT == null)} onClick= {this.fetchData && this._showSearch.bind(null, true)}>Search Offences</button>
          )}
          {(this.state.showSearch && !(loading)) && (
            <button id="chartBtn" disabled= {(this.state.selectedOffence == null) || (JWT == null)} onClick= {this.fetchData && this._showChart.bind(null, true)} ref="chartBtn">Show Chart</button>
          )}
          {(this.state.showSearch && !(loading)) && (
            <button id="mapBtn" disabled= {(this.state.selectedOffence == null) || (JWT == null)} onClick= {this.fetchData && this._showMap.bind(null, true)} ref="mapBtn">Show Map</button>
          )}
          <button id="resetBtn" onClick= {this.clearSearch}>Clear Search</button>
          <br />
          <div id="searchTable">
            <br />
            {this.state.showSearch && (
              <ReactTable
                id="searchReactTable"
                data={data}
                columns={[
                  {
                    Header: searchStr,
                    columns: [
                      {
                        Header: "LGA",
                        accessor: "LGA"
                      },
                      {
                        Header: "Total",
                        accessor: "total"
                      }
                    ]
                  }
                ]}
                defaultPageSize={10}
                loading={loading}
                onFetchData={this.fetchData}
              />
            )}
            {(this.state.showSearch && this.state.showChart) && (
              <Bar data = {chartData}/>
            )}
            {(this.state.showMap && this.state.showSearch) && (
              <div id="mapid">
                <GoogleMapReact
                  bootstrapURLKeys={{ key:  "AIzaSyAEcvBy5OVFuQh-ywSnCy0jTN32heaDodU"}}
                  defaultCenter={this.props.center}
                  defaultZoom={this.props.zoom}
                  heatmapLibrary={true}
                  heatmap={heatMapData}
                >
                </GoogleMapReact>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
