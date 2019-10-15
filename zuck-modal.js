/*
    zuck.js
    https://github.com/ramon82/zuck.js
    MIT License
*/

(global => {
	const ZuckModalJS = (() => {
	  const w = global;

	  const ZuckModalJS = function (options) {
		const d = document;
        const zuck = this;

		const query = function (qs) {
		  return d.querySelectorAll(qs)[0];
        };

		const get = function (array, what) {
		  if (array) {
			return array[what] || '';
		  } else {
			return '';
		  }
		};

		const each = function (arr, func) {
		  if (arr) {
			const total = arr.length;

			for (let i = 0; i < total; i++) {
			  func(i, arr[i]);
			}
		  }
		};

		const setVendorVariable = function (ref, variable, value) {
		  const variables = [
			variable.toLowerCase(),
			`webkit${variable}`,
			`MS${variable}`,
			`o${variable}`
		  ];

		  each(variables, (i, val) => {
			ref[val] = value;
		  });
		};

		const addVendorEvents = function (el, func, event) {
		  const events = [
			event.toLowerCase(),
			`webkit${event}`,
			`MS${event}`,
			`o${event}`
		  ];

		  each(events, (i, val) => {
			el.addEventListener(val, func, false);
		  });
		};

		const onAnimationEnd = function (el, func) {
		  addVendorEvents(el, func, 'AnimationEnd');
		};

		const onTransitionEnd = function (el, func) {
		  if (!el.transitionEndEvent) {
			el.transitionEndEvent = true;

			addVendorEvents(el, func, 'TransitionEnd');
		  }
		};

		const prepend = function (parent, child) {
		  if (parent.firstChild) {
			parent.insertBefore(child, parent.firstChild);
		  } else {
			parent.appendChild(child);
		  }
		};

		const fullScreen = function (elem, cancel) {
		  const func = 'RequestFullScreen';
		  const elFunc = 'requestFullScreen'; // crappy vendor prefixes.

		  try {
			if (cancel) {
			  if (
				document.fullscreenElement ||
				document.webkitFullscreenElement ||
				document.mozFullScreenElement ||
				document.msFullscreenElement
			  ) {
				if (document.exitFullscreen) {
				  document.exitFullscreen()
					.catch(() => {});
				} else if (document.mozCancelFullScreen) {
				  document.mozCancelFullScreen()
					.catch(() => {});
				} else if (document.webkitExitFullscreen) {
				  document.webkitExitFullscreen()
					.catch(() => {});
				}
			  }
			} else {
			  if (elem[elFunc]) {
				elem[elFunc]();
			  } else if (elem[`ms${func}`]) {
				elem[`ms${func}`]();
			  } else if (elem[`moz${func}`]) {
				elem[`moz${func}`]();
			  } else if (elem[`webkit${func}`]) {
				elem[`webkit${func}`]();
			  }
			}
		  } catch (e) {
			console.warn('[Zuck.js] Can\'t access fullscreen');
		  }
		};

		const translate = function (element, to, duration, ease) {
		  const direction = to > 0 ? 1 : -1;
		  const to3d = (Math.abs(to) / query('#zuck-modal').offsetWidth) * 90 * direction;

		  if (option('cubeEffect')) {
			const scaling = to3d === 0 ? 'scale(0.95)' : 'scale(0.930,0.930)';

			setVendorVariable(
			  query('#zuck-modal-content').style,
			  'Transform',
			  scaling
			);

			if (to3d < -90 || to3d > 90) {
			  return false;
			}
		  }

		  const transform = !option('cubeEffect')
			? `translate3d(${to}px, 0, 0)`
			: `rotateY(${to3d}deg)`;

		  if (element) {
			setVendorVariable(element.style, 'TransitionTimingFunction', ease);
			setVendorVariable(element.style, 'TransitionDuration', `${duration}ms`);
			setVendorVariable(element.style, 'Transform', transform);
		  }
		};

		const findPos = function (obj, offsetY, offsetX, stop) {
		  let curleft = 0;
		  let curtop = 0;

		  if (obj) {
			if (obj.offsetParent) {
			  do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;

				if (obj === stop) {
				  break;
				}
			  } while ((obj = obj.offsetParent));
			}

			if (offsetY) {
			  curtop = curtop - offsetY;
			}

			if (offsetX) {
			  curleft = curleft - offsetX;
			}
		  }

		  return [curleft, curtop];
		};

		let getStoryRelativeCurrent = function (what) {
			// my wife told me to stop singing Wonderwall. I SAID MAYBE.
			const currentStory = zuck.internalData['currentStory'];

			if (currentStory) {
				let foundStoryId;
				const index = zuck.storyIds.indexOf(currentStory);

				if (what === 'previous') {
					foundStoryId = zuck.storyIds[index - 1];
				} else if (what === 'next') {
					foundStoryId = zuck.storyIds[index + 1];
				}

				if (foundStoryId !== undefined) {
					const data = zuck.data[foundStoryId] || false;

					return data;
				}
			}

			return false;
		};

		  /* options */
		const optionsDefault = {
		  id: 'zuck',
		  skin: 'snapgram',
		  avatars: true,
		  stories: [],
		  backButton: true,
		  backNative: false,
		  previousTap: true,
		  autoFullScreen: false,
		  openEffect: true,
		  cubeEffect: false,
		  list: false,
          localStorage: true,
		  callbacks: {
			onRender: function (item, mediaHtml) {
			  return mediaHtml;
			},
			onOpen: function (storyId, callback) {
			  callback();
			},
            onView: function (storyId) {},
            onClickBlock: function (event) {},
			onEnd: function (storyId, callback) {
			  callback();
			},
			onClose: function (storyId, callback) {
			  callback();
			},
			onNextItem: function (storyId, nextStoryId, callback) {
			  callback();
			},
			onNavigateItem: function (
			  storyId,
			  nextStoryId,
			  callback
			) {
			  callback();
			}
		  },
		  language: {
			unmute: 'Touch to unmute',
			keyboardTip: 'Press space to see next',
			visitLink: 'Visit link',
			time: {
			  ago: 'ago',
			  hour: 'hour ago',
			  hours: 'hours ago',
			  minute: 'minute ago',
			  minutes: 'minutes ago',
			  fromnow: 'from now',
			  seconds: 'seconds ago',
			  yesterday: 'yesterday',
			  tomorrow: 'tomorrow',
			  days: 'days ago'
			}
		  }
		};

		let option = function (name, prop) {
		  const type = function (what) {
			return typeof what !== 'undefined';
		  };

		  if (prop) {
			if (type(options[name])) {
			  return type(options[name][prop])
				? options[name][prop]
				: optionsDefault[name][prop];
			} else {
			  return optionsDefault[name][prop];
			}
		  } else {
			return type(options[name]) ? options[name] : optionsDefault[name];
		  }
		};

		const id = option('id');

		  /* modal */
		const ZuckModal = function () {
		  let modalZuckContainer = query('#zuck-modal');

		  if (!modalZuckContainer && !w['Zuck'].hasModal) {
			w['Zuck'].hasModal = true;

			modalZuckContainer = d.createElement('div');
			modalZuckContainer.id = 'zuck-modal';

			if (option('cubeEffect')) {
			  modalZuckContainer.className = 'with-cube';
			}

			modalZuckContainer.innerHTML = '<div id="zuck-modal-content"></div>';
			modalZuckContainer.style.display = 'none';

			modalZuckContainer.setAttribute('tabIndex', '1');
			modalZuckContainer.onkeyup = ({keyCode}) => {
			  const code = keyCode;

			  if (code === 27) {
				modal.close();
			  } else if (code === 13 || code === 32) {
				modal.next();
			  }
			};

			if (option('openEffect')) {
			  modalZuckContainer.classList.add('with-effects');
			}

			onTransitionEnd(modalZuckContainer, () => {
			  if (modalZuckContainer.classList.contains('closed')) {
				modalContent.innerHTML = '';
				modalZuckContainer.style.display = 'none';
				modalZuckContainer.classList.remove('closed');
				modalZuckContainer.classList.remove('animated');
			  }
			});

			d.body.appendChild(modalZuckContainer);
		  }

		  let modalContent = query('#zuck-modal-content');
		  const moveStoryItem = function (direction) {
			const modalContainer = query('#zuck-modal');

			let target = '';
			let useless = '';
			let transform = '0';
            const modalSlider = query(`#zuck-modal-slider-${id}`);

			const slideItems = {
			  previous: query('#zuck-modal .story-viewer.previous'),
			  next: query('#zuck-modal .story-viewer.next'),
			  viewing: query('#zuck-modal .story-viewer.viewing')
			};

			if (
			  (!slideItems['previous'] && !direction) ||
				(!slideItems['next'] && direction)
			) {
			  return false;
			}

			if (!direction) {
			  target = 'previous';
			  useless = 'next';
			} else {
			  target = 'next';
			  useless = 'previous';
			}

			const transitionTime = 600;
			if (option('cubeEffect')) {
			  if (target === 'previous') {
				transform = modalContainer.slideWidth;
			  } else if (target === 'next') {
				transform = modalContainer.slideWidth * -1;
			  }
			} else {
			  transform = findPos(slideItems[target]);
			  transform = transform[0] * -1;
			}

			translate(modalSlider, transform, transitionTime, null);

			setTimeout(() => {
			  if (target !== '' && slideItems[target] && useless !== '') {
				const currentStory = slideItems[target].getAttribute('data-story-id');
				zuck.internalData['currentStory'] = currentStory;

				const oldStory = query(`#zuck-modal .story-viewer.${useless}`);
				if (oldStory) {
				  oldStory.parentNode.removeChild(oldStory);
				}

				if (slideItems['viewing']) {
				  slideItems['viewing'].classList.add('stopped');
				  slideItems['viewing'].classList.add(useless);
				  slideItems['viewing'].classList.remove('viewing');
				}

				if (slideItems[target]) {
				  slideItems[target].classList.remove('stopped');
				  slideItems[target].classList.remove(target);
				  slideItems[target].classList.add('viewing');
				}

				const newStoryData = getStoryRelativeCurrent(target);
				if (newStoryData) {
				  createStoryViewer(newStoryData, target);
				}

				const storyId = zuck.internalData['currentStory'];
				let items = query(`#zuck-modal [data-story-id="${storyId}"]`);

				if (items) {
				  items = items.querySelectorAll('[data-index].active');
				  const duration = items[0].firstElementChild;

				  zuck.data[storyId]['currentItem'] = parseInt(
					items[0].getAttribute('data-index'),
					10
				  );

				  items[0].innerHTML =
					  `<b style="${duration.style.cssText}"></b>`;
				  onAnimationEnd(items[0].firstElementChild, () => {
					zuck.nextItem(false);
				  });
				}

				translate(modalSlider, '0', 0, null);

				if (items) {
				  playVideoItem([items[0], items[1]], true);
				}

				option('callbacks', 'onView')(zuck.internalData['currentStory']);
			  }
			}, transitionTime + 50);
		};

		  let createStoryViewer = function (
			storyData,
			className,
			forcePlay
		  ) {
			const modalSlider = query(`#zuck-modal-slider-${id}`);

			let htmlItems = '';
            let pointerItems = '';

			const storyId = get(storyData, 'id');
			const slides = d.createElement('div');
			const currentItem = get(storyData, 'currentItem') || 0;
			const exists = query(
			  `#zuck-modal .story-viewer[data-story-id="${storyId}"]`
			);

			let currentItemTime = '';
			let currentItemSponsorText = '';

			if (exists) {
			  return false;
            }

			slides.className = 'slides';
			each(get(storyData, 'items'), (i, item) => {
			  if (currentItem > i) {
				storyData['items'][i]['seen'] = true;
				item['seen'] = true;
              }

			  const itemId = get(item, 'id');
			  const length = get(item, 'length');
			  const linkText = get(item, 'linkText');
			  const seenClass = get(item, 'seen') === true ? 'seen' : '';
			  const commonAttrs = `data-index="${i}" data-item-id="${itemId}"`;
              const renderCallback = option('callbacks', 'onRender');

			  if (currentItem === i) {
				currentItemTime = get(item, 'time');
				currentItemSponsorText = get(item, 'sponsorText');
			  }

			  pointerItems += `
			    <span ${commonAttrs} class="${currentItem === i ? 'active' : ''} ${seenClass}">
					<b style="animation-duration:${length === '' ? '3' : length}s"></b>
                </span>`;

			  htmlItems += `
				<div data-time="${get(item, 'time')}" data-sponsor-text="${get(item, 'sponsorText')}" data-type="${get(item, 'type')}"${commonAttrs} class="item ${seenClass} ${currentItem === i ? 'active' : ''}">
					${renderCallback(item, `
						${get(item, 'type') === 'video' ? `
							<video class="media" muted webkit-playsinline playsinline preload="auto" src="${get(item, 'src')}"
								${get(item, 'type')}>
							</video>
						` : `
					        <img class="media" src="${get(item, 'src')}" ${get(item, 'type')}>
						`}
						${get(item, 'showLink') ? `
							${get(item, 'link') ?`
						  		<a class="tip link" href="${get(item, 'link')}" rel="noopener" target="_blank">
									<div class="link-button"></div>
									<div class="link-text">${linkText}</div>
						  		</a>
						  	` : `
							<div class="tip link" onclick="stopPropagation(event);" ontouchstart="stopPropagation(event);">
							  <div class="link-button"></div>
							  <div class="link-text">${linkText}</div>
							</div>
							`}
						` : `
						`}
						${get(item, 'block') ? `
							${get(item, 'block')}
							` : `
							`}
						`)}
				</div>`;
			});

      slides.innerHTML = htmlItems;

      onClickBlock = function (event) {
        option('callbacks', 'onClickBlock')(event);
      }

			const video = slides.querySelector('video');
			const addMuted = function (video) {
			  if (video.muted) {
				storyViewer.classList.add('muted');
			  } else {
				storyViewer.classList.remove('muted');
			  }
			};

			if (video) {
			  video.onwaiting = e => {
				if (video.paused) {
				  storyViewer.classList.add('paused');
				  storyViewer.classList.add('loading');
				}
			  };

			  video.onplay = () => {
				addMuted(video);

				storyViewer.classList.remove('stopped');
				storyViewer.classList.remove('paused');
				storyViewer.classList.remove('loading');
			  };

			  video.onready = video.onload = video.onplaying = video.oncanplay = () => {
				addMuted(video);

				storyViewer.classList.remove('loading');
			  };

			  video.onvolumechange = () => {
				addMuted(video);
			  };
			}

			let storyViewer = d.createElement('div');
			storyViewer.className =
				`story-viewer muted ${className} ${!forcePlay ? 'stopped' : ''} ${option('backButton') ? 'with-back-button' : ''}`;
			storyViewer.setAttribute('data-story-id', storyId);

			const html =
				`<div class="head">
					<div class="left">
						${option('backButton') ? '<a class="back">&lsaquo;</a>' 
						: ''}<u class="img" style="background-image:url(${get(storyData, 'photo')});"></u>
						<div>
							<div>
								<strong>${get(storyData, 'name')}</strong>
								<span class="time">${currentItemTime}</span>
							</div>
							<div class="sponsor-text">${currentItemSponsorText}</div>
						</div>
					</div>

					<div class="right">
						<span class="time">${currentItemTime}</span>
						<span class="loading"></span>
						<a class="close" tabIndex="2"></a>
					</div>
				</div>
				<div class="slides-pointers">
					<div>${pointerItems}</div>
				</div>
				<div class="bottom-icons" onclick="stopPropagation(event);" ontouchstart="stopPropagation(event);">
					<div class="send"></div>
					<div class="more"></div>
			  	</div>`;
			storyViewer.innerHTML = html;

			each(storyViewer.querySelectorAll('.close, .back'), (i, el) => {
			  el.onclick = e => {
				e.preventDefault();
				modal.close();
			  };
			});

			storyViewer.appendChild(slides);

			stopPropagation = function (event) {
				event.stopImmediatePropagation();
				event.preventDefault();
			}

			if (className === 'viewing') {
			  playVideoItem(
				storyViewer.querySelectorAll(
				  `[data-index="${currentItem}"].active`
				),
				false
			  );
			}

			each(
				storyViewer.querySelectorAll('.slides-pointers [data-index] > b'),
				(i, el) => {
					onAnimationEnd(el, () => {
						zuck.nextItem(false);
					});
				}
			);

			if (className === 'previous') {
			  prepend(modalSlider, storyViewer);
			} else {
			  modalSlider.appendChild(storyViewer);
            }
		  };

		  const createStoryTouchEvents = function (
			modalSliderElement
		  ) {
			const modalContainer = query('#zuck-modal');
			const enableMouseEvents = true;

			const modalSlider = modalSliderElement;
			let position = {};
			let touchOffset = void 0;
			let isScrolling = void 0;
			let delta = void 0;
			let timer = void 0;
			let nextTimer = void 0;

			const touchStart = function (event) {
			  const storyViewer = query('#zuck-modal .viewing');

			  if (event.target.nodeName === 'A') {
				return true;
			  } else {
				event.preventDefault();
			  }

			  const touches = event.touches ? event.touches[0] : event;
			  const pos = findPos(query('#zuck-modal .story-viewer.viewing'));

			  modalContainer.slideWidth = query(
				'#zuck-modal .story-viewer'
			  ).offsetWidth;
			  position = {
				x: pos[0],
				y: pos[1]
			  };

			  const pageX = touches.pageX;
			  const pageY = touches.pageY;

			  touchOffset = {
				x: pageX,
				y: pageY,
				time: Date.now()
			  };

			  isScrolling = undefined;
			  delta = {};

			  if (enableMouseEvents) {
				modalSlider.addEventListener('mousemove', touchMove);
				modalSlider.addEventListener('mouseup', touchEnd);
				modalSlider.addEventListener('mouseleave', touchEnd);
			  }
			  modalSlider.addEventListener('touchmove', touchMove);
			  modalSlider.addEventListener('touchend', touchEnd);

			  if (storyViewer) {
				storyViewer.classList.add('paused');
			  }
			  pauseVideoItem();

			  timer = setTimeout(() => {
				storyViewer.classList.add('longPress');
			  }, 600);

			  nextTimer = setTimeout(() => {
				clearInterval(nextTimer);
				nextTimer = false;
			  }, 250);
			};

			let touchMove = function (event) {
			  const touches = event.touches ? event.touches[0] : event;
			  const pageX = touches.pageX;
			  const pageY = touches.pageY;

			  if (touchOffset) {
				delta = {
				  x: pageX - touchOffset.x,
				  y: pageY - touchOffset.y
				};

				if (typeof isScrolling === 'undefined') {
				  isScrolling = !!(
					isScrolling || Math.abs(delta.x) < Math.abs(delta.y)
				  );
				}

				if (!isScrolling && touchOffset) {
				  event.preventDefault();
				  translate(modalSlider, position.x + delta.x, 0, null);
				}
			  }
			};

			let touchEnd = function (event) {
			  const storyViewer = query('#zuck-modal .viewing');
			  const lastTouchOffset = touchOffset;

			  if (delta) {
				const duration = touchOffset ? Date.now() - touchOffset.time : undefined;
				const isValid = (Number(duration) < 300 && Math.abs(delta.x) > 25) || Math.abs(delta.x) > modalContainer.slideWidth / 3;
				const direction = delta.x < 0;

				const index = direction ? query('#zuck-modal .story-viewer.next') : query('#zuck-modal .story-viewer.previous');
				const isOutOfBounds = (direction && !index) || (!direction && !index);

				if (!isScrolling) {
				  if (isValid && !isOutOfBounds) {
					moveStoryItem(direction);
				  } else {
					translate(modalSlider, position.x, 300);
				  }
				}

				touchOffset = undefined;

				if (enableMouseEvents) {
				  modalSlider.removeEventListener('mousemove', touchMove);
				  modalSlider.removeEventListener('mouseup', touchEnd);
				  modalSlider.removeEventListener('mouseleave', touchEnd);
				}
				modalSlider.removeEventListener('touchmove', touchMove);
				modalSlider.removeEventListener('touchend', touchEnd);
			  }

			  const video = zuck.internalData['currentVideoElement'];

			  if (timer) {
				clearInterval(timer);
			  }

			  if (storyViewer) {
				playVideoItem(storyViewer.querySelectorAll('.active'), false);
				storyViewer.classList.remove('longPress');
				storyViewer.classList.remove('paused');
			  }

			  if (nextTimer) {
				clearInterval(nextTimer);
				nextTimer = false;

				const navigateItem = function () {
				  if (
					lastTouchOffset.x > global.screen.width / 3 ||
					  !option('previousTap')
				  ) {
					zuck.nextItem('next');
				  } else {
					zuck.nextItem('previous');
				  }
				};

				const storyViewerViewing = query('#zuck-modal .viewing');

				if (storyViewerViewing && video) {
				  if (storyViewerViewing.classList.contains('muted')) {
					unmuteVideoItem(video, storyViewerViewing);
				  } else {
					navigateItem();
				  }
				} else {
				  navigateItem();

				  return false;
				}
			  }
			};

			modalSlider.addEventListener('touchstart', touchStart);
			if (enableMouseEvents) {
			  modalSlider.addEventListener('mousedown', touchStart);
			}
		  };

		  return {
			show: function show (storyId, fromElem) {
			  const modalContainer = query('#zuck-modal');

			  const callback = function () {
				modalContent.innerHTML =
					`<div id="zuck-modal-slider-${id}" class="slider"></div>`;

				const storyData = zuck.data[storyId];
				const currentItem = storyData['currentItem'] || 0;
				const modalSlider = query(`#zuck-modal-slider-${id}`);

				createStoryTouchEvents(modalSlider);

				zuck.internalData['currentStory'] = storyId;
				storyData['currentItem'] = currentItem;

				if (option('backNative')) {
				  global.location.hash = `#!${id}`;
				}

				const previousItemData = getStoryRelativeCurrent('previous');
				if (previousItemData) {
				  createStoryViewer(previousItemData, 'previous');
				}

				createStoryViewer(storyData, 'viewing', true);

				const nextItemData = getStoryRelativeCurrent('next');
				if (nextItemData) {
				  createStoryViewer(nextItemData, 'next');
				}

				if (option('autoFullScreen')) {
				  modalContainer.classList.add('fullscreen');
				}

				const tryFullScreen = function () {
				  if (
					modalContainer.classList.contains('fullscreen') &&
					  option('autoFullScreen') &&
					  global.screen.width <= 1024
				  ) {
					fullScreen(modalContainer);
				  }

				  modalContainer.focus();
				};

				if (option('openEffect')) {
				  const storyEl = fromElem;
				  const pos = findPos(storyEl);

				  modalContainer.style.marginLeft =
					  `${pos[0] + storyEl.offsetWidth / 2}px`;
				  modalContainer.style.marginTop =
					  `${pos[1] + storyEl.offsetHeight / 2}px`;

				  modalContainer.style.display = 'block';

				  modalContainer.slideWidth = query(
					'#zuck-modal .story-viewer'
				  ).offsetWidth;

				  setTimeout(() => {
					modalContainer.classList.add('animated');
				  }, 10);

				  setTimeout(() => {
					tryFullScreen();
				  }, 300); // because effects
				} else {
				  modalContainer.style.display = 'block';
				  modalContainer.slideWidth = query(
					'#zuck-modal .story-viewer'
				  ).offsetWidth;

				  tryFullScreen();
				}

				option('callbacks', 'onView')(storyId);
			  };

			  option('callbacks', 'onOpen')(storyId, callback);
			},
			next: function next () {
			  const callback = function () {
				const nextItemData = getStoryRelativeCurrent('next');
				if (nextItemData) {
				  createStoryViewer(nextItemData, 'next');
				}

				const stories = query('#zuck-modal .story-viewer.next');
				if (!stories) {
				  modal.close();
				} else {
				  moveStoryItem(true);
				}
			  };

			  const lastStory = zuck.internalData['currentStory'];

			  if (lastStory) {
				zuck.data[lastStory]['seen'] = true;
				zuck.internalData['seenItems'][lastStory] = true;

				saveLocalData('seenItems', zuck.internalData['seenItems']);
			  }

			  option('callbacks', 'onEnd')(
				zuck.internalData['currentStory'],
				callback
			  );
			},
			close: function close () {
			  const modalContainer = query('#zuck-modal');

			  const callback = function () {
				if (option('backNative')) {
				  global.location.hash = '';
				}

				fullScreen(modalContainer, true);

				modalContent.innerHTML = '';
				modalContainer.style.display = 'none';
			  };

			  option('callbacks', 'onClose')(
				zuck.internalData['currentStory'],
				callback
			  );
			}
		  };
		};
		let modal = new ZuckModal();

		let playVideoItem = function (elements) {
		  const itemElement = elements[1];
		  const itemPointer = elements[0];
		  const storyViewer = itemPointer.parentNode.parentNode.parentNode;

		  if (!itemElement || !itemPointer) {
			return false;
		  }

		  const cur = zuck.internalData['currentVideoElement'];
		  if (cur) {
			cur.pause();
		  }

		  if (itemElement.getAttribute('data-type') === 'video') {
			const video = itemElement.getElementsByTagName('video')[0];
			if (!video) {
			  zuck.internalData['currentVideoElement'] = false;

			  return false;
			}

			const setDuration = function () {
			  if (video.duration) {
				setVendorVariable(
				  itemPointer.getElementsByTagName('b')[0].style,
				  'AnimationDuration',
				  `${video.duration}s`
				);
			  }
			};

			setDuration();
			video.addEventListener('loadedmetadata', setDuration);
			zuck.internalData['currentVideoElement'] = video;

			video.play();
		  } else {
			zuck.internalData['currentVideoElement'] = false;
		  }
		};

		let pauseVideoItem = function () {
		  const video = zuck.internalData['currentVideoElement'];
		  if (video) {
			try {
			  video.pause();
			} catch (e) {}
		  }
		};

		let unmuteVideoItem = function (video, storyViewer) {
		  video.muted = false;
		  video.volume = 1.0;
		  video.removeAttribute('muted');
		  video.play();

		  if (video.paused) {
			video.muted = true;
			video.play();
		  }

		  if (storyViewer) {
			storyViewer.classList.remove('paused');
		  }
		};

		  /* data functions */
		let saveLocalData = function (key, data) {
		  try {
			if (option('localStorage')) {
			  const keyName = `zuck-${id}-${key}`;

			  global.localStorage[keyName] = JSON.stringify(data);
			}
		  } catch (e) {}
		};

		const getLocalData = function (key) {
		  if (option('localStorage')) {
			const keyName = `zuck-${id}-${key}`;

			return global.localStorage[keyName]
			  ? JSON.parse(global.localStorage[keyName])
			  : false;
		  } else {
			return false;
		  }
		};

		  /* api */
		zuck.data = {};
		zuck.storyIds = [];
		zuck.internalData = {
			seenItems: {}
		};

		zuck.add = (data) => {
		  const storyId = get(data, 'id');
		  const items = get(data, 'items');

		  zuck.storyIds.push(storyId);
		  zuck.data[storyId] = {
			id: storyId,
			kind: get(data, 'kind'),
			name: get(data, 'name'),
			photo: get(data, 'photo'),
			items: [],
		  };

		  each(items, (i, item) => {
			zuck.addItem(storyId, item);
		  });
		};
		zuck.next = () => {
		  modal.next();
		};
		zuck.addItem = (storyId, data) => {
		  zuck.data[storyId].items.push({
            src: get(data, 'src'),
            id: get(data, 'id'),
            length: get(data, 'length'),
            type: get(data, 'type'),
			time: get(data, 'time'),
			sponsorText: get(data, 'sponsorText'),
            link: get(data, 'link'),
            linkText: get(data, 'linkText'),
            preview: get(data, 'preview'),
			block: get(data, 'block'),
			showLink: get(data, 'showLink'),
		  });
		};
		zuck.nextItem = (direction) => {
			const currentStory = zuck.internalData['currentStory'];
			const currentItem = zuck.data[currentStory]['currentItem'];
			const storyViewer = query(
				`#zuck-modal .story-viewer[data-story-id="${currentStory}"]`
			);
			const directionNumber = direction === 'previous' ? -1 : 1;

			if (!storyViewer || storyViewer.touchMove === 1) {
				return false;
			}

			const currentItemElements = storyViewer.querySelectorAll(
				`[data-index="${currentItem}"]`
			);
			const currentPointer = currentItemElements[0];
			const currentItemElement = currentItemElements[1];

			const navigateItem = currentItem + directionNumber;
			const nextItems = storyViewer.querySelectorAll(
				`[data-index="${navigateItem}"]`
			);
			const nextPointer = nextItems[0];
			const nextItem = nextItems[1];

			if (storyViewer && nextPointer && nextItem) {
				const navigateItemCallback = function () {
					if (direction === 'previous') {
						currentPointer.classList.remove('seen');
						currentItemElement.classList.remove('seen');
					} else {
						currentPointer.classList.add('seen');
						currentItemElement.classList.add('seen');
					}

					currentPointer.classList.remove('active');
					currentItemElement.classList.remove('active');

					nextPointer.classList.remove('seen');
					nextPointer.classList.add('active');

					nextItem.classList.remove('seen');
					nextItem.classList.add('active');

					each(storyViewer.querySelectorAll('.time'), (i, el) => {
						el.innerText = nextItem.getAttribute('data-time');
					});

					each(storyViewer.querySelectorAll('.sponsor-text'), (i, el) => {
						el.innerText = nextItem.getAttribute('data-sponsor-text');
					});

					zuck.data[currentStory]['currentItem'] =
						zuck.data[currentStory]['currentItem'] + directionNumber;

					playVideoItem(nextItems, event);
				};

				let callback = option('callbacks', 'onNavigateItem');
				callback = !callback
					? option('callbacks', 'onNextItem')
					: option('callbacks', 'onNavigateItem');

				callback(
					currentStory,
					nextItem.getAttribute('data-story-id'),
					navigateItemCallback
				);
			} else if (storyViewer) {
				if (direction !== 'previous') {
					modal.next();
				}
			}
		};

		const init = function () {
		  each(option('stories'), (i, item) => {
			zuck.add(item);
		  });

		  return zuck;
		};

		init();

		return {
		  openStory: (storyId, fromElem) => {
			modal.show(storyId, fromElem);
		  },
		  onVolumeUp: () => {
			const storyViewerViewing = query('#zuck-modal .viewing');
			const video = zuck.internalData['currentVideoElement'];
	
			if (storyViewerViewing.classList.contains('muted')) {
				unmuteVideoItem(video, storyViewerViewing);
			}
		  },
		  nextItem: (direction) => {
			zuck.nextItem(direction);
		  },
		  close: () => {
			modal.close();
		  },
		  removeStories: () => {
			zuck.storyIds = [];
			zuck.data = {};
		  },
		  addStory: (story) => {
			zuck.add(story);
		  },
		  addStories: (stories) => {
			each(stories, (i, item) => {
				zuck.add(item);
			});
		  }
		};
	  };

		/* Helpers */
	  ZuckModalJS.buildItem = (id, type, length, src, preview, link, linkText, seen, sponsorText, time, block, showLink) => {
		return {
		  id,
		  type,
		  length,
		  src,
		  preview,
		  link,
		  linkText,
		  seen,
		  time,
		  sponsorText,
		  block,
		  showLink
		};
	  };

	  return ZuckModalJS;
	})();

	// AMD support
	if (typeof define === 'function' && define.amd) {
	  define(() => { return ZuckModalJS; });
	  // CommonJS and Node.js module support.
	} else if (typeof exports !== 'undefined') {
	  // Support Node.js specific `module.exports` (which can be a function)
	  if (typeof module !== 'undefined' && module.exports) {
		exports = module.exports = ZuckModalJS;
	  }
	  // But always support CommonJS module 1.1.1 spec (`exports` cannot be a function)
	  exports.ZuckModalJS = ZuckModalJS;
	} else {
	  global.ZuckModalJS = ZuckModalJS;
	}
})(window);
