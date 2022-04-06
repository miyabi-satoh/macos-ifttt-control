import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { faDropbox } from "@fortawesome/free-brands-svg-icons";
import crypto from "crypto";

const date = new Date();
const hash = crypto
  .createHash("md5")
  .update(Math.random() + "dtm" + date.getTime())
  .digest("hex");

export function Install() {
  const [publicLink, setPublicLink] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {};
  const handleInstall = async () => {
    const result = await window.api.doInstall({
      // hash,
      public_link: publicLink,
    });
  };

  useEffect(() => {
    const f = async () => {
      // const result = await window.api.createHashFile(hash);
    };

    f();
  }, []);

  return (
    <div className="py-5 px-5 text-center">
      <h2>Install macOS IFTTT Control</h2>
      <p className="pt-4 px-5">
        Before you can start using macOS IFTTT Control, you need to configure
        your Dropbox account first. <br />A file named "<i>{hash}</i>" has been
        placed on your Desktop, Now please create a folder called
        "macOSIFTTTControl" in the root of your Dropbox account and then upload
        the file into it.
      </p>
      <div className="display-1 text-info py-3">
        <FontAwesomeIcon icon={faDownload} />
      </div>
      <div className="px-5 py-4 text-start">
        <div className="form-group">
          <label htmlFor="dropbox_url">
            <FontAwesomeIcon icon={faDropbox} className="text-info mr-1" />{" "}
            <strong>Dropbox Public Link</strong>
          </label>
          <input
            type="text"
            className="form-control shadow-sm border border-info text-secondary mt-2"
            id="dropbox_url"
            placeholder="Dropbox Public Link"
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="py-3">
        <button
          type="button"
          className="btn btn-info install"
          onClick={handleInstall}
        >
          Install macOS IFTTT Control
        </button>
      </div>
    </div>
  );
}
