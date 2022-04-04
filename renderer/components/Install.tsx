import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import crypto from "crypto";

export function Install() {
  const [hash, setHash] = useState("");

  const handleGenerate = () => {
    const date = new Date();
    const digest = crypto
      .createHash("md5")
      .update(Math.random() + "dtm" + date.getTime())
      .digest("hex");

    console.log(`handleGenerate`);
  };
  const handleInstall = () => {
    console.log(`handleInstall`);
  };

  return (
    <div className="py-5 px-5 text-center">
      <h2>Install macOS IFTTT Control</h2>
      <div className="display-1 text-info py-3">
        <FontAwesomeIcon icon={faDownload} />
      </div>
      <div className="py-3 text-start">
        <ol>
          <li className="mb-3">
            Generate hash file on your Desktop.
            <div className="py-1">
              <button
                type="button"
                className="btn btn-info"
                onClick={handleGenerate}
              >
                Generate
              </button>
            </div>
          </li>
          <li className="mb-3">
            Create a folder called "macOSIFTTTControl" in the root of your
            Dropbox account and then upload the hash file into it.(manually)
          </li>
          <li>
            Copy Dropbox public link, and paste here.
            <div className="form-group">
              {/* <label htmlFor="dropbox_url">
                <FontAwesomeIcon icon={faDropbox} className="text-info mr-1" />{" "}
                <strong>Dropbox Public Link</strong>
              </label> */}
              <input
                type="text"
                className="form-control shadow-sm border border-info text-secondary"
                id="dropbox_url"
                placeholder="Dropbox Public Link"
              />
            </div>
          </li>
        </ol>
      </div>

      {/* <p className="pt-4 px-5">
        Before you can start using macOS IFTTT Control, you need to configure
        your Dropbox account first. <br />A file named "<i id="mac_hash"></i>"
        has been placed on your Desktop, Now please create a folder called
        "macOSIFTTTControl" in the root of your Dropbox account and then upload
        the file into it.
      </p> */}
      {/* <div className="px-5 py-4 text-start"></div> */}
      <div className="py-3">
        <button type="button" className="btn btn-info" onClick={handleInstall}>
          Install macOS IFTTT Control
        </button>
      </div>
    </div>
  );
}
