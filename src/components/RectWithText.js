// RectWithText.js
import { fabric } from 'fabric';

fabric.RectWithText = fabric.util.createClass(fabric.Rect, {
  type: 'rectWithText',
  text: null,
  textOffsetLeft: 0,
  textOffsetTop: 0,
  _prevObjectStacking: null,
  _prevAngle: 0,
  topLeft: [0, 0],
  topRight: [0, 0],
  bottomLeft: [0, 0],
  bottomRight: [0, 0],

  initialize: function (rectOptions, textOptions, text) {
    this.callSuper('initialize', rectOptions);
    this.text = new fabric.Textbox(text, {
      ...textOptions,
      selectable: false,
      evented: false,
    });
    this.textOffsetLeft = this.text.left - this.left;
    this.textOffsetTop = this.text.top - this.top;

    // Ensure corners are defined
    this.topLeft = rectOptions.topLeft || [0, 0];
    this.topRight = rectOptions.topRight || [0, 0];
    this.bottomLeft = rectOptions.bottomLeft || [0, 0];
    this.bottomRight = rectOptions.bottomRight || [0, 0];

    this.on('moving', this.recalcTextPosition);
    this.on('rotating', () => {
      this.text.rotate(this.text.angle + this.angle - this._prevAngle);
      this.recalcTextPosition();
      this._prevAngle = this.angle;
    });
    this.on('scaling', this.recalcTextPosition);
    this.on('added', () => {
      this.canvas.add(this.text);
    });
    this.on('removed', () => {
      this.canvas.remove(this.text);
    });
    this.on('mousedown:before', () => {
      this._prevObjectStacking = this.canvas.preserveObjectStacking;
      this.canvas.preserveObjectStacking = true;
    });
    this.on('mousedblclick', () => {
      this.text.selectable = true;
      this.text.evented = true;
      this.canvas.setActiveObject(this.text);
      this.text.enterEditing();
      this.selectable = false;
    });
    this.on('deselected', () => {
      this.canvas.preserveObjectStacking = this._prevObjectStacking;
    });
    this.text.on('editing:exited', () => {
      this.text.selectable = false;
      this.text.evented = false;
      this.selectable = true;
    });
  },

  _render: function (ctx) {
    const w = this.width;
    const h = this.height;
    const x = -this.width / 2;
    const y = -this.height / 2;
    const k = 1 - 0.5522847498;
    ctx.beginPath();
    ctx.moveTo(x + this.topLeft[0], y);
    ctx.lineTo(x + w - this.topRight[0], y);
    ctx.bezierCurveTo(x + w - k * this.topRight[0], y, x + w, y + k * this.topRight[1], x + w, y + this.topRight[1]);
    ctx.lineTo(x + w, y + h - this.bottomRight[1]);
    ctx.bezierCurveTo(x + w, y + h - k * this.bottomRight[1], x + w - k * this.bottomRight[0], y + h, x + w - this.bottomRight[0], y + h);
    ctx.lineTo(x + this.bottomLeft[0], y + h);
    ctx.bezierCurveTo(x + k * this.bottomLeft[0], y + h, x, y + h - k * this.bottomLeft[1], x, y + h - this.bottomLeft[1]);
    ctx.lineTo(x, y + this.topLeft[1]);
    ctx.bezierCurveTo(x, y + k * this.topLeft[1], x + k * this.topLeft[0], y, x + this.topLeft[0], y);
    ctx.closePath();
    this._renderPaintInOrder(ctx);
  },

  recalcTextPosition: function () {
    const sin = Math.sin(fabric.util.degreesToRadians(this.angle));
    const cos = Math.cos(fabric.util.degreesToRadians(this.angle));
    const newTop = sin * this.textOffsetLeft + cos * this.textOffsetTop;
    const newLeft = cos * this.textOffsetLeft - sin * this.textOffsetTop;
    const rectLeftTop = this.getPointByOrigin('left', 'top');
    this.text.set('left', rectLeftTop.x + newLeft);
    this.text.set('top', rectLeftTop.y + newTop);
  },
});

export default fabric.RectWithText;
