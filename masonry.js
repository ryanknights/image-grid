(function ($)
{	
	// =========================================================
	// Debounce

	function debounce (fn)
	{
		var timer = null,
			self  = this;

		return function ()
		{
			clearTimeout(timer);

			timer = setTimeout(function ()
			{
				fn();

			}, self.options.debounce);
		}
	}

	// =========================================================
	// Constructor

	function imageGrid (el, options)
	{
		this.$el = $(el);
		this.el  = el;

		this.options = $.extend({}, this.defaultOptions, options);

		this.items  = this.$el.find(this.options.itemSelector);

		this._init();
	}

	// =========================================================
	// Default Options

	imageGrid.prototype.defaultOptions =
	{
		itemSelector : 'div',
		rowHeight    : 250,
		debounce     : 250,
		responsive   : true
	};

	// =========================================================
	// Initialisation

	imageGrid.prototype._init = function ()
	{
		this._initGrid();
		this._events();
	};

	// =========================================================
	// Initialise Grid

	imageGrid.prototype._initGrid = function ()
	{
		this.containerWidth = this.el.getBoundingClientRect().width;
		this.buffer         = [];
		this.currentOffset  = 0;

		// =========================================================
		// Set all images in correct ratio according to the max row height

		for (var item = 0; item < this.items.length; item++)
		{
			this._setRatioDimensions($(this.items[item]));
		}

		// =========================================================
		// Set images final dimesions

		for (item = 0; item < this.items.length; item++)
		{
			this._setFinalDimensions($(this.items[item]));
		}

		// =========================================================
		// If we have remaining images after the previous loop completes

		if (this.buffer.length)
		{	
			console.log('Remaining Items: ' + this.buffer.length);

			// =========================================================
			// If one image remaing just set its ratio dimensions to fit max row height

			if (this.buffer.length === 1)
			{
				this._setRatioDimensions(this.buffer[0]);
			}
			else
			{	
				// =========================================================
				// If we have more than 1 left over image loop them setting the final dimesions until we are correct

				for (item = 0; item < this.buffer.length; item++)
				{	
					this._setRatioDimensions($(this.buffer[item]));
				}
			}
		}	
	};

	// =========================================================
	// Events

	imageGrid.prototype._events = function ()
	{	
		var self = this;

		if (this.options.responsive)
		{	
			var fn = debounce.call(this, function ()
			{
				self.refresh();
			});

			$(window).resize(fn);
		}
	};

	// =========================================================
	// Set Ratio Dimesions

	imageGrid.prototype._setRatioDimensions = function (item)
	{	
		var ratio  = item.width() / item.height(),
			height = this.options.rowHeight - (item.outerHeight(true) - item.height()),
			width  = ratio * height;

		item.height(Math.floor(height)).width(Math.floor(width));
	};

	// =========================================================
	// Set Final Width/Height Dimensions

	imageGrid.prototype._setFinalDimensions = function (item, debug)
	{
		var itemOffset = item.offset().left + item.outerWidth();

		this.buffer.push(item);

		if (itemOffset <= this.currentOffset)
		{
			var totalWidth = 0,
				invariantW = 0;

			for (var i = 0; i < this.buffer.length; i++)
			{
				var el = $(this.buffer[i]);

				totalWidth += el.innerWidth();
				invariantW += el.outerWidth(true) - el.innerWidth();			
			}

			for (i = 0; i < this.buffer.length; i++)
			{
				var el         = $(this.buffer[i]),
					ratio      = el.width() / el.height(),
					invariantH = el.outerHeight(true) - el.innerHeight(),
					height     = (this.containerWidth - invariantW) / (totalWidth / (this.options.rowHeight - invariantH)),
					width      = ratio * height;

				el.height(Math.floor(height)).width(Math.floor(width));
			}

			this.buffer        = [];
			this.currentOffset = 0;
		}
		else
		{
			this.currentOffset = itemOffset;
		}		
	};

	// =========================================================
	// Refresh - Public Method

	imageGrid.prototype.refresh = function ()
	{
		this._initGrid();
	};

	// =========================================================
	// Plugin

	function Plugin (options)
	{
		return this.each(function ()
		{
			if (!$(this).data('imageGrid'))
			{
				$(this).data('imageGrid', new imageGrid(this, options));
			}
			else
			{
				$(this).data('imageGrid').refresh();
			}
		});
	}

	$.fn.imageGrid = Plugin;

}(jQuery));