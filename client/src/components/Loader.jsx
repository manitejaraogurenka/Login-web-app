import React from "react";
import { Circles } from "react-loader-spinner";
import styles from "../styles/Loaderspinner.module.css";

function LoaderSpinner() {
  return (
    <div className={styles.loader_container}>
      <Circles
        height={"120"}
        width={"120"}
        color="rgb(110,130,248)"
        visible={true}
      />
    </div>
  );
}

export default LoaderSpinner;
