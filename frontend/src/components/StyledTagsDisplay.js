import React from "react";

const StyledTagsDisplay = ({ tags }) => {
  return (
    <div style={styles.container}>
      {tags.map((tag, index) => (
        <div key={index} style={styles.tagBubble}>
          {tag}
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    flexWrap: "wrap", 
    gap: "10px", 
    justifyContent: "flex-start", 
    marginTop: "10px"
  },
  tagBubble: {
    padding: "10px 15px",
    backgroundColor: "#A9A9A9",
    borderRadius: "20px",
    fontSize: "14px",
    fontWeight: "bold",
    color: "#333",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
    flex: "0 0 calc(50% - 10px)", 
    textAlign: "center", 
  },
};

export default StyledTagsDisplay;
