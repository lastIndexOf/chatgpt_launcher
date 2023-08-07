import { useEffect } from "react";
import { appWindow } from "@tauri-apps/api/window";
import styled from "styled-components";
import { black_1, gray_2, gray_4, red_9 } from "../styles/colors";

const Container = styled.div`
  position: relative;
  height: 56px;
  background: ${gray_2};
  user-select: none;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;

  &::before {
    position: absolute;
    bottom: 0;
    content: "";
    width: 100%;
    height: 1px;
    border-bottom: 1px solid ${gray_4};
    transform: scaleY(75%);
  }

  &:hover .titlebar-button {
    &.close {
      background-color: ${red_9};
      color: ${black_1};
    }
  }
`;

const Button = styled.div`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 12px;
  height: 12px;
  font-size: 10px;
  font-weight: 700;
  background-color: ${gray_4};
  border-radius: 50%;
  margin-left: 8px;
  color: transparent;
  cursor: default;

  &:first-of-type {
    margin-left: 20px;
  }
`;

export const Titlebar = () => {
  useEffect(() => {
    const minimize = () => appWindow.minimize();
    const toggleMaximize = () => () => appWindow.toggleMaximize();
    const close = () => appWindow.close();

    const titlebarMin = document.getElementById("titlebar-minimize");
    const titlebarMax = document.getElementById("titlebar-maximize");
    const titlebarClose = document.getElementById("titlebar-close");

    // titlebarMin?.addEventListener("click", minimize);
    // titlebarMax?.addEventListener("click", toggleMaximize);
    // titlebarClose?.addEventListener("click", close);

    return () => {
      // titlebarMin?.removeEventListener("click", minimize);
      // titlebarMax?.removeEventListener("click", toggleMaximize);
      // titlebarClose?.removeEventListener("click", close);
    };
  }, []);

  return (
    <Container data-tauri-drag-region className="titlebar">
      <Button className="titlebar-button close" id="titlebar-minimize">
        x
      </Button>
      <Button className="titlebar-button" id="titlebar-maximize"></Button>
      <Button className="titlebar-button" id="titlebar-close"></Button>
    </Container>
  );
};
