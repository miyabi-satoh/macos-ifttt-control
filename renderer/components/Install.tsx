import React from "react";

export function Install() {
  return (
    <div className="py-5 px-5 text-center">
      <h2>Install macOS IFTTT Control</h2>
      <p className="pt-4 px-5">
        Before you can start using macOS IFTTT Control, you need to configure
        your Dropbox account first. <br />A file named "<i id="mac_hash"></i>"
        has been placed on your Desktop, Now please create a folder called
        "macOSIFTTTControl" in the root of your Dropbox account and then upload
        the file into it.
      </p>
      <div className="display-1 text-info py-3">
        <i className="fas fa-download"></i>
      </div>
      <div className="px-5 py-4 text-left">
        <div className="form-group">
          <label htmlFor="dropbox_url">
            <i className="fab fa-dropbox text-info mr-1"></i>{" "}
            <strong>Dropbox Public Link</strong>
          </label>
          <input
            type="text"
            className="form-control shadow-sm border border-info text-secondary"
            id="dropbox_url"
            placeholder="Dropbox Public Link"
          />
        </div>
      </div>
      <div className="py-3">
        <button type="button" className="btn btn-info install">
          Install macOS IFTTT Control
        </button>
      </div>
    </div>
  );
}
