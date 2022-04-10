import dynamic from "next/dynamic";
import React, { useEffect } from "react";
import {
  Modal,
  Form,
  ToggleButtonGroup,
  ToggleButton,
  Button,
} from "react-bootstrap";
import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { IconContext } from "react-icons";
import { FaTimes, FaCheck } from "react-icons/fa";

export type WebhookProps = {
  url: string;
  icon: string[];
  color: string;
  title: string;
};

const colors = [
  { value: "info", text: "Cyan" },
  { value: "primary", text: "Blue" },
  { value: "success", text: "Green" },
  { value: "warning", text: "Yellow" },
  { value: "danger", text: "Red" },
  { value: "dark", text: "Gray" },
] as const;

type WebhookDialogProps = {
  show: boolean;
  onHide: () => void;
  onSubmit: SubmitHandler<WebhookProps>;
  icons: string[];
};

export function WebhookDialog(props: WebhookDialogProps) {
  const { show, onHide, onSubmit, icons } = props;
  const { control, handleSubmit, reset, watch } = useForm<WebhookProps>({
    defaultValues: {
      url: "",
      icon: [],
      color: "info",
      title: "",
    },
  });

  const watchIcon = watch("icon");

  useEffect(() => {
    reset();
  }, [show]);

  return (
    <Modal show={show} onHide={onHide}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Webhook</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Webhook URL</Form.Label>
            <Controller
              name="url"
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  type="text"
                  placeholder="Webhook URL..."
                />
              )}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Webhook Icon</Form.Label>
            <Controller
              name="icon"
              control={control}
              render={({ field }) => (
                <ToggleButtonGroup
                  {...field}
                  type="checkbox"
                  size="sm"
                  className="flex-wrap overflow-auto w-100 h-px-100"
                  onChange={(val: string[]) => {
                    const iconKey = val.slice(-1)[0];
                    field.onChange([iconKey]);
                  }}
                >
                  {icons.map((icon) => {
                    const IconComponent = dynamic(
                      () =>
                        import("react-icons/fa").then((mod: any) => mod[icon]),
                      { ssr: false }
                    );
                    return (
                      <ToggleButton
                        className="me-2 ms-0 mb-2 flex-grow-0"
                        key={icon}
                        id={icon}
                        value={icon}
                        variant={
                          !!watchIcon && watchIcon.includes(icon)
                            ? "outline-primary"
                            : "outline-secondary"
                        }
                      >
                        {/* variant={
                          watch("icon", []).includes(icon)
                            ? "outline-primary"
                            : "outline-secondary"
                        } */}
                        <IconContext.Provider value={{ className: "fs-md" }}>
                          <IconComponent />
                        </IconContext.Provider>
                      </ToggleButton>
                    );
                  })}
                </ToggleButtonGroup>
              )}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Webhook Color</Form.Label>
            <Controller
              name="color"
              control={control}
              render={({ field }) => (
                <Form.Select {...field}>
                  {colors.map((color) => {
                    return (
                      <option key={color.value} value={color.value}>
                        {color.text}
                      </option>
                    );
                  })}
                </Form.Select>
              )}
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Webhook Title</Form.Label>
            <Controller
              name="title"
              control={control}
              render={({ field }) => (
                <Form.Control
                  {...field}
                  type="text"
                  placeholder="Webhook Title..."
                />
              )}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" size="sm" onClick={onHide}>
            <FaTimes /> Close
          </Button>
          <Button variant="info" size="sm" type="submit">
            <FaCheck /> Save changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
