import React, { Component } from 'react';
import axios from "axios";
import fileDownload from "js-file-download";

import './App.css';

class App extends Component {

  state = {
    username: null,
    formName: null,
    files: [],
    inputFile: null,
    loaded: 0
  };

  getUserFiles = async() => {
    const {username} = this.state;
    await axios.get(`http://localhost:8080/${username}/files`)
          .then(res => {
            this.setState({files: res.data.data.files});
          }).catch(err => console.log(err));
  };

  handleLogin = (e) => {
    e.preventDefault();
    const {formName} = this.state;

    axios.get(`http://localhost:8080/check-user/${formName}`).then(res => {
        const {isExist} = res.data;

        if(isExist) {
          this.setState({username: this.state.formName, formName: ""});
          this.getUserFiles()
        } else {
          if(window.confirm(`Create new user with name ${formName}?`)) {
            axios.get(`http://localhost:8080/new-user/${formName}`).then(res => {
              alert("New user created");
              this.setState({username: formName, formName: ""});
              this.getUserFiles();
            });
          } else {
            this.setState({formName: ""});
          }
        }
    });
  };

  handleChange = (e) => {
    this.setState({inputFile: e.target.files[0]});
  };

  handleFormSubmit = (e) => {
      e.preventDefault();
      const formData = new FormData();
      formData.append("myFile", this.state.inputFile);
      formData.append("username", "zulhaqim");
      const config = {
          headers: {
              'content-type': 'multipart/form-data'
          }
      };

      axios.post(`http://localhost:8080/upload/${this.state.username}`, formData, config)
          .then((response) => {
              this.getUserFiles();
          }).catch((error) => console.log(error));
  };

  renderLogin = () => (<div>
      <h3>Enter username or create new to continue..</h3>
      <form onSubmit={this.handleLogin}>
        <input onChange={ e => this.setState({formName: e.target.value})} type="text" />
        <button type="submit">Submit</button>
      </form>
    </div>);

  renderFilesList = () => {
    const {files} = this.state;
    const config = {
      responseType: "blob"
    };

    return files.map((file, index) => <div key={index} style={{border: "1px solid #eaeaea", marginBottom: "2%", padding: "1% 3%"}}>
      {file.filename} <button style={{float: "right"}}
      onClick={() => axios.get(`http://localhost:8080/download/${file.filename}`, config).then(res => fileDownload(res.data, file.filename)).catch(err => console.log(err))}>Download</button></div>);
  };

  render() {
    const {username, files} = this.state;
    return (
      <div className="App">
          <h1>File Uploader!</h1>
          {!username && this.renderLogin()}
          {username && <div>
            <h3>{username}</h3>
            <form onSubmit={this.handleFormSubmit}>
              <input type="file" onChange= {this.handleChange} />
              <button type="submit">Upload</button>
            </form>
          </div>}
        <div style={{margin: "3% 20%"}}>
          {files.length > 0 && this.renderFilesList()}
        </div>
      </div>
    );
  }
}

export default App;
