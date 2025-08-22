import React from "react";
import "../styles/JoinPage.css";
import joinFullImage from "../assets/join.png"; // or whatever your full image is named

const HowToJoinPage = () => {
  return (
    <div className="join-image-page">
      <img
        src={joinFullImage}
        alt="How to Join Amrutam"
        className="join-full-image"
      />
    </div>
  );
};

export default HowToJoinPage;
