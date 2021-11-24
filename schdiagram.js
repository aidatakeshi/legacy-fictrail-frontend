const $ = require('~/common.js');
const config = require('~/schdiagram-config.js');

exports.constraintTransformation = function($this, target = null){
    //Scale Constraint
    if ($this.xscale < config.xscale_min) $this.xscale = config.xscale_min;
    if ($this.xscale > config.xscale_max) $this.xscale = config.xscale_max;
    if ($this.yscale < config.yscale_min) $this.yscale = config.yscale_min;
    if ($this.yscale > config.yscale_max) $this.yscale = config.yscale_max;
    if ($this.xscale < $this.contentWidth / $this.basisWidth) $this.xscale = $this.contentWidth / $this.basisWidth;
    if ($this.yscale < $this.contentHeight / $this.basisHeight) $this.yscale = $this.contentHeight / $this.basisHeight;
    //Position Constraint
    var xpos_min = $this.contentWidth / 2 / $this.basisWidth / $this.xscale;
    var ypos_min = $this.contentHeight / 2 / $this.basisHeight / $this.yscale;
    if ($this.xpos < xpos_min) $this.xpos = xpos_min;
    else if ($this.xpos > 1 - xpos_min) $this.xpos = 1 - xpos_min;
    if ($this.ypos < ypos_min) $this.ypos = ypos_min;
    else if ($this.ypos > 1 - ypos_min) $this.ypos = 1 - ypos_min;
    //Adjust xpos, ypos
    if (target){
        target.setAttr('x', $this.contentMidX - $this.xpos * $this.basisWidth * $this.xscale);
        target.setAttr('y', $this.contentMidY - $this.ypos * $this.basisHeight * $this.yscale);
    }
    //Redraw
    $this.draw();
};