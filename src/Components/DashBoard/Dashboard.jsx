import React from "react";
import LeaderBoard from "./LeaderBoard";
import { navigate } from "@reach/router";
import firebase from "../../config";
import "firebase/firestore";

import exit from "../../img/exit2.png";
import cactus from "../../img/cactus-avatar.png";
import zombie from "../../img/zombie-avatar.png";
import sheep from "../../img/sheep-avatar.png";
import coffee from "../../img/coffee-avatar.png";
import alien from "../../img/alien-avatar.png";
import sloth from "../../img/sloth-avatar.png";
import online from "../../img/online.png";

const db = firebase.firestore();
const rooms = db.collection("rooms");
const onlineUsers = db.collection("onlineUsers");

class DashBoard extends React.Component {
  state = {
    user: "",
    loading: true,
    onlineUsers: [],
  };

  generateCode = () => {
    let result = "";
    let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let i = 0; i < 4; i++) {
      result += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    return rooms
      .doc(result)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return result;
        } else {
          return this.generateCode();
        }
      });
  };

  setUpRoom = (code, multi) => {
    return rooms
      .doc(code)
      .set({
        host: this.props.user,
        current_question: 0,
        time_up: false,
        showQuiz: false,
        multi: multi,
      })

      .then(() => {
        return rooms.doc(code).collection("users").doc(this.props.user).set({
          username: this.props.user,
          score: 0,
          answers: [],
          incorrect_answers: 0,
          avatar: this.props.avatar,
        });
        //create a collection of users within the room doc, within rooms collection
        // make the room doc(as generated code), puts in the active user into the room
        //doing this here, so that users are available to view in host lobby
      })
      .then(() => {
        return code;
      });
  };

  hostSolo = (event) => {
    event.preventDefault();
    this.hostGame(false);
  };

  hostMulti = (event) => {
    event.preventDefault();
    this.hostGame(true);
  };

  hostGame = (multi) => {
    this.props.setHost(true);
    this.generateCode()
      .then((code) => {
        return this.setUpRoom(code, multi);
      })
      .then((code) => {
        navigate(`/quiz/${code}`);
      });
  };

  joinGame = (event) => {
    event.preventDefault();
    navigate(`/quiz`);
  };

  logOut = () => {
    onlineUsers.doc(this.props.user).delete();
    navigate(`/`);
  };

  componentDidMount() {
    onlineUsers.get().then((users) => {
      const newOnlineUsers = [];
      users.forEach((user) => {
        newOnlineUsers.push(user.data().username);
      });
      this.setState({ loading: false, onlineUsers: [...newOnlineUsers] });
    });
  }

  onlineUsersListener = onlineUsers.onSnapshot((usersSnapshot) => {
    let newOnlineUsers = [];
    usersSnapshot.forEach((user) => {
      newOnlineUsers.push(user.data().username);
    });
    this.setState({
      onlineUsers: [...newOnlineUsers],
    });
  });

  render() {
    return (
      <div className="dashboard-container">
        <header className="dashboard-header">
          <div className="dashboard-header-buttons">
            <img
              src={exit}
              className="logout-btn"
              onClick={this.logOut}
              alt="logout button"
            ></img>
          </div>
          <img
            className="user-avatar"
            src={
              this.props.avatar === "zombie"
                ? zombie
                : this.props.avatar === "cactus"
                ? cactus
                : this.props.avatar === "sheep"
                ? sheep
                : this.props.avatar === "coffee"
                ? coffee
                : this.props.avatar === "alien"
                ? alien
                : this.props.avatar === "sloth"
                ? sloth
                : null
            }
            alt="user avatar"
          />

          <h1 className="dashboard-greeting">Hello, {this.props.user}!</h1>
        </header>
        <div className="dashboard-play-buttons">
          <button className="play-btn" onClick={this.hostMulti}>
            HOST GAME
          </button>
          <button className="play-btn" onClick={this.joinGame}>
            JOIN GAME
          </button>
          <button className="play-btn" onClick={this.hostSolo}>
            SOLO GAME
          </button>
        </div>
        <LeaderBoard />

        <div className="online-users">
          <h3>Online Users:</h3>
          <div className="user-list">
            {this.state.loading ? (
              <h4>Loading Users...</h4>
            ) : (
              this.state.onlineUsers.map((user, i) => {
                return (
                  <div className="online-user" key={`online${i}`}>
                    <img
                      className="online-icon"
                      src={online}
                      alt="gamepad icon"
                    ></img>
                    {user}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default DashBoard;
