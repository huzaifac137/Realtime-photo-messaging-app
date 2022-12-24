import React, { Component, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import ScrollToBottom from "react-scroll-to-bottom";

function App() {
  const socketRef = useRef();
  const [IMAGE, setIMAGE] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [recievedImg, setRecievedImg] = useState([]);
  const [buttonIsVisible, setButtonIsVisible] = useState(false);
  const [NAME, setNAME] = useState(null);
  const [nameisConfirmed, setNameIsConfirmed] = useState(false);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");
  }, []);

  const imagePickerHandler = (e) => {
    setIMAGE(e.target.files[0]);
    setButtonIsVisible(true);
  };

  const submitImage = () => {
    const data = { image: IMAGE, name: NAME };
    const sent = previewURL.split(",")[1];
    setRecievedImg((prev) => {
      return [...prev, { img: sent, name: NAME }];
    });
    socketRef.current.emit("sendImg", data);
  };

  useEffect(() => {
    socketRef.current.on("recieveImg", (data) => {
      console.log(data);
      setRecievedImg((prev) => {
        return [...prev, { img: data.image, name: data.name }];
      });
    });
  }, []);

  useEffect(() => {
    if (!IMAGE) {
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviewURL(fileReader.result);
    };
    fileReader.readAsDataURL(IMAGE);
  }, [IMAGE]);

  const nameHandler = (e) => {
    setNAME(e.target.value);
  };

  const confirmNameHandler = () => {
    setNameIsConfirmed(true);
    socketRef.current.emit("add-user", NAME);
  };

  return (
    <div className="App">
      <h1
        style={{
          textAlign: "center",
          borderBottom: "1px solid green",
        }}
      >
        REALTIME PIC SHARE WITHOUT DATABASE{" "}
      </h1>
      {NAME ? (
        <div style={{ display: "flex" }}>
          <h4>You are :</h4>
          <h3> {NAME}</h3>
        </div>
      ) : null}
      <ScrollToBottom className="scroll" scrollViewClassName="scrollView">
        {recievedImg &&
          recievedImg.map((item) => (
            <div key={Math.random()}>
              <h3
                key={Math.random() * Math.random()}
                style={{
                  borderBottom: "1px solid green",
                }}
              >
                {item.name}
              </h3>
              <img
                style={{
                  width: "200px",
                  height: "200px",
                  border: "1px solid black",
                  overflow: "hidden",
                }}
                key={Math.random() * Math.random()}
                src={`data:image/png;base64,${item.img}`}
              />
            </div>
          ))}
      </ScrollToBottom>
      <div
        style={{
          display: "flex",
          gap: "30px",
          alignItems: "center",
          margin: "20px",
        }}
      >
        {nameisConfirmed === true ? (
          <>
            <input
              type="file"
              accept=".jpg , .png , .jpeg"
              placeholder="send picture"
              onChange={imagePickerHandler}
            />
            {buttonIsVisible === true && (
              <button onClick={submitImage}>SEND</button>
            )}

            {previewURL && (
              <img
                src={previewURL}
                alt="img"
                width={100}
                height={100}
                style={{
                  border: "1px solid black",
                  overflow: "hidden",
                  marginLeft: "20px",
                }}
              />
            )}
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="ENTER NAME"
              onChange={nameHandler}
            />
            <button onClick={confirmNameHandler}>CONFIRM</button>{" "}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
