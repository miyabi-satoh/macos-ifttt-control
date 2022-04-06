import { useEffect, useState } from "react";
// import { Install } from "../components/Install";
import Layout from "../components/Layout";
import { Config } from "../interfaces";

const IndexPage = () => {
  const [config, setConfig] = useState<Config | undefined>(undefined);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const f = async () => {
      setConfig(await window.api.getConfig());
      setTitle(await window.api.getAppName());
    };
    f();
  }, []);

  if (config === undefined) {
    return null;
  }

  return (
    <Layout title={title}>
      <div className="p-4">
        <div id="webhooks">
          <h6 className="pb-2 text-muted">
            <small>Trigger a Webhook-based Applet:</small>
          </h6>
          <div className="row px-3">
            {/* Webhooks will be listed here */}

            <div
              id="webhooks-empty"
              className="w-100 p-2"
              style={{ display: "none" }}
            >
              <div className="bg-info text-white shadow rounded px-4 py-3">
                There are no Webhook Triggers added yet. Why don't you add one
                right now?
              </div>
            </div>
          </div>
        </div>

        <div id="events" className="pt-4">
          <h6 className="pb-2 text-muted">
            <small>Manage Webhook Events:</small>
          </h6>
          <div className="row px-3">
            {/* Events will be listed here */}

            <div
              id="events-empty"
              className="w-100 p-2"
              style={{ display: "none" }}
            >
              <div className="bg-info text-white shadow rounded px-4 py-3">
                There are no Webhook Events added yet. Why don't you add one
                right now?
              </div>
            </div>
          </div>
        </div>

        <div id="options" className="pt-4">
          <h6 className="pb-2 text-muted">
            <small>Options:</small>
          </h6>
          <div className="row">
            <div className="col-12 col-md-4 text-left pb-1">
              <button
                type="button"
                className="btn btn-sm btn-info btn-block"
                data-toggle="modal"
                data-target="#add-webhook"
              >
                <i className="fas fa-plus"></i> Add Webhook Trigger
              </button>
            </div>
            <div
              className="modal fade"
              id="add-webhook"
              tabIndex={-1}
              role="dialog"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title text-info">Add Webhook</h5>
                    <button
                      type="button"
                      className="close mt-n4"
                      data-dismiss="modal"
                      aria-label="Close"
                    >
                      <i className="fas fa-times fs-md"></i>
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label htmlFor="webhook_url">Webhook URL</label>
                      <input
                        type="text"
                        className="form-control"
                        id="webhook_url"
                        placeholder="Webhook URL"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="webhook_icon">Webhook Icon</label>
                      <div id="webhook_icons" className="p-1">
                        {/* Font Awesome icons will be listed here */}
                      </div>
                      <input
                        type="hidden"
                        id="webhook_icon"
                        value="fas fa-rocket"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="webhook_color">Webhook Color</label>
                      <select className="form-control" id="webhook_color">
                        <option value="info">Cyan</option>
                        <option value="primary">Blue</option>
                        <option value="success">Green</option>
                        <option value="warning">Yellow</option>
                        <option value="danger">Red</option>
                        <option value="dark">Gray</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="webhook_title">Webhook Title</label>
                      <input
                        type="text"
                        className="form-control"
                        id="webhook_title"
                        placeholder="Webhook Title"
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      data-dismiss="modal"
                    >
                      <i className="fas fa-times"></i> Close
                    </button>
                    <button
                      id="submit_add_webhook"
                      type="button"
                      className="btn btn-sm btn-info"
                    >
                      <i className="fas fa-check"></i> Save changes
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4 text-center pb-1">
              <button
                type="button"
                className="btn btn-sm btn-info btn-block"
                data-toggle="modal"
                data-target="#add-event"
              >
                <i className="fas fa-plus"></i> Add Webhook Event
              </button>
            </div>

            <div
              className="modal fade"
              id="add-event"
              tabIndex={-1}
              role="dialog"
            >
              <div className="modal-dialog" role="document">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title text-info">Add Event</h5>
                    <button
                      type="button"
                      className="close mt-n4"
                      data-dismiss="modal"
                      aria-label="Close"
                    >
                      <i className="fas fa-times fs-md"></i>
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label htmlFor="event_url">Event URL</label>
                      <input
                        type="text"
                        className="form-control"
                        id="event_url"
                        placeholder="Event URL"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="event_command">Trigger</label>
                      <select className="form-control" id="event_command">
                        <option disabled>Automatic Trigger</option>
                        <option value="auto-battery">
                          Battery drops below 20%
                        </option>
                        <option value="auto-bluetooth-off">
                          Bluetooth is turned off
                        </option>
                        <option value="auto-bluetooth-on">
                          Bluetooth is turned on
                        </option>
                        <option disabled></option>
                        <option disabled>macOS IFTTT Events</option>
                        <option value="automator">automator</option>
                        <option value="ifttt">ifttt</option>
                        <option value="ifttt">macrodroid</option>
                        <option value="ifttt">webhook</option>
                        <option value="bluetooth">bluetooth</option>
                        <option value="dir">dir</option>
                        <option value="disk">disk</option>
                        <option value="display">display</option>
                        <option value="dns">dns</option>
                        <option value="dock">dock</option>
                        <option value="finder">finder</option>
                        <option value="firewall">firewall</option>
                        <option value="flightmode">flightmode</option>
                        <option value="gatekeeper">gatekeeper</option>
                        <option value="hostname">hostname</option>
                        <option value="info">info</option>
                        <option value="itunes">itunes</option>
                        <option value="lock">lock</option>
                        <option value="ntp">ntp</option>
                        <option value="printer">printer</option>
                        <option value="network">network</option>
                        <option value="nosleep">nosleep</option>
                        <option value="notification">notification</option>
                        <option value="restart">restart</option>
                        <option value="safeboot">safeboot</option>
                        <option value="screensaver">screensaver</option>
                        <option value="service">service</option>
                        <option value="shutdown">shutdown</option>
                        <option value="sleep">sleep</option>
                        <option value="timezone">timezone</option>
                        <option value="touchbar">touchbar</option>
                        <option value="trash">trash</option>
                        <option value="update">update</option>
                        <option value="user">user</option>
                        <option value="volume">volume</option>
                        <option value="vpn">vpn</option>
                        <option value="wallpaper">wallpaper</option>
                        <option value="wifi">wifi</option>
                        <option value="download">download</option>
                        <option value="notificationcenter">
                          notificationcenter
                        </option>
                        <option value="open">open</option>
                        <option value="say">say</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-sm btn-secondary"
                      data-dismiss="modal"
                    >
                      <i className="fas fa-times"></i> Close
                    </button>
                    <button
                      id="submit_add_event"
                      type="button"
                      className="btn btn-sm btn-info"
                    >
                      <i className="fas fa-check"></i> Save changes
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-md-4 text-right pb-1">
              <a
                href="http://abdyfran.co/projects/macos-ifttt/marketplace"
                target="_blank"
                className="btn btn-sm btn-info btn-block external-link"
              >
                <i className="fas fa-rocket"></i> Marketplace
              </a>
            </div>
          </div>
        </div>
      </div>
      <div id="footer" className="py-4 text-muted">
        <div
          id="mac_hash_tooltip"
          className="tooltip bs-tooltip-top"
          onClick={() => "$(this).fadeOut();"}
          role="tooltip"
          style={{ opacity: 1, display: "none" }}
        >
          <div className="arrow ml-2"></div>
          <div className="tooltip-inner bg-secondary shadow fs-sm">
            <i className="fas fa-check"></i> Copied to Clipboard!
          </div>
        </div>
        <small>
          Mac Hash: <i id="mac_hash"></i>
        </small>
        <div className="float-right">
          <a
            href="https://github.com/abdyfranco/macos-ifttt-control/wiki"
            target="_blank"
            className="text-muted fs-sm external-link"
          >
            <i className="fas fa-book mr-1"></i> Documentation
          </a>
        </div>
      </div>

      <div className="modal fade" id="alert-dialog" tabIndex={-1} role="dialog">
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-body text-center py-5">
              <div className="pb-4">
                <h1 id="alert-dialog-icon" className="pb-2 text-center">
                  <i className="fas fa-times-circle"></i>
                </h1>
                <h4 id="alert-dialog-title"></h4>
                <h6 id="alert-dialog-content" className="text-dark pt-2"></h6>
              </div>
              <button
                type="button"
                className="btn btn-secondary"
                data-dismiss="modal"
              >
                <i className="fas fa-times"></i>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IndexPage;
