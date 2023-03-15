import { screen } from 'electron';

export const defaultSize = {
  width: 752,
  height: 73,
};

export class SizeDetector {
  private _width = defaultSize.width;
  private _height = defaultSize.height;

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  get fullHeight() {
    return Math.floor((screen.getPrimaryDisplay().workAreaSize.height * 2) / 3);
  }
}
