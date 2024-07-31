import * as fabric from 'fabric';

class Table extends fabric.Object {
  constructor(options) {
    super(options);
    this.set('type', 'table');
    this._initializeTable(options);
  }

  _initializeTable(options) {
    this.rows = options.rows || 0;
    this.cols = options.cols || 0;
    this.data = options.data || [];

    // Set initial properties
    this.set('width', options.width || 100);
    this.set('height', options.height || 100);
    this.set('fill', 'transparent');
    this.set('stroke', 'black');

    this._renderTable();
  }

  _renderTable() {
    const ctx = this.canvas.getContext('2d');
    if (!ctx) return;

    const cellWidth = this.width / this.cols;
    const cellHeight = this.height / this.rows;

    ctx.clearRect(0, 0, this.width, this.height);

    // Draw table grid
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = 1;

    for (let i = 0; i <= this.rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(this.width, i * cellHeight);
      ctx.stroke();
    }

    for (let i = 0; i <= this.cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, this.height);
      ctx.stroke();
    }

    // Draw table data
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '14px Arial';

    this.data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        ctx.fillText(cell, colIndex * cellWidth + cellWidth / 2, rowIndex * cellHeight + cellHeight / 2);
      });
    });
  }

  _render(ctx) {
    this._renderTable();
  }

  toObject() {
    return {
      ...super.toObject(),
      rows: this.rows,
      cols: this.cols,
      data: this.data,
    };
  }
}

// Register the custom class with Fabric.js
fabric.Table = Table;
