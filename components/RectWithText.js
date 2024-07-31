// RectWithText.js
import * as fabric from 'fabric';

// Define the custom RectWithText class
fabric.RectWithText = fabric.util.createClass(fabric.Rect, {
    type: 'rectWithText',
    
    initialize: function (rectOptions, textOptions, text) {
      this.callSuper('initialize', rectOptions);
      this.text = new fabric.Textbox(text, {
        ...textOptions,
        selectable: false,
        evented: false,
      });
      this.textOffsetLeft = this.text.left - this.left;
      this.textOffsetTop = this.text.top - this.top;
  
      this.on('moving', () => this.recalcTextPosition());
      this.on('rotating', () => {
        this.text.rotate(this.text.angle + this.angle - this._prevAngle);
        this.recalcTextPosition();
        this._prevAngle = this.angle;
      });
      this.on('scaling', () => this.recalcTextPosition());
      this.on('added', () => this.canvas.add(this.text));
      this.on('removed', () => this.canvas.remove(this.text));
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
  
    recalcTextPosition: function () {
      const sin = Math.sin(fabric.util.degreesToRadians(this.angle));
      const cos = Math.cos(fabric.util.degreesToRadians(this.angle));
      const newTop = sin * this.textOffsetLeft + cos * this.textOffsetTop;
      const newLeft = cos * this.textOffsetLeft - sin * this.textOffsetTop;
      const rectLeftTop = this.getPointByOrigin('left', 'top');
      this.text.set('left', rectLeftTop.x + newLeft);
      this.text.set('top', rectLeftTop.y + newTop);
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
    }
  });
  
  // Register the custom class in the fabric namespace
  fabric.RectWithText.fromObject = function (object) {
    return new fabric.RectWithText(object.rectOptions, object.textOptions, object.text);
  };
  
  // Define custom serialization
  fabric.RectWithText.prototype.toObject = function () {
    return {
      ...this.callSuper('toObject'),
      rectOptions: this.getObjectOptions(),
      textOptions: this.text.toObject(),
      text: this.text.text
    };
  };
  
  export default fabric.RectWithText;