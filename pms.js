
// INITIALIZATION
let ready = false;
let hasBody = false;

let body = document.querySelector('body');
let head  = document.getElementsByTagName('head')[0];
if (!body) {
  body = document.createElement('body_temp');
  document.querySelector('html').append(body);
}
const videoBgContainer = document.createElement("div");
const videoBg = document.createElement('video');
const loadingFullScreen = document.createElement("div");

body.style.backgroundImage = `url(${chrome.runtime.getURL("images/pms/bg.jpg")})`;
body.style.backgroundRepeat = 'no-repeat';
body.style.backgroundSize = 'cover';
loadingFullScreen.style.position = 'fixed';
loadingFullScreen.style.top = '0';
loadingFullScreen.style.left = '0';
loadingFullScreen.style.width = '100vw';
loadingFullScreen.style.height = '100vh';
loadingFullScreen.style.backgroundColor = '#eee';
loadingFullScreen.style.zIndex = '99999';
loadingFullScreen.style.display = 'flex';
loadingFullScreen.style.justifyContent = 'center';
loadingFullScreen.style.alignItems = 'center';
const loadingIcon = document.createElement('img');
loadingIcon.src = chrome.runtime.getURL("images/pms/loading-gif.gif");
loadingIcon.style.width = '32px';
loadingIcon.style.aspectRatio = '1';
loadingFullScreen.append(loadingIcon);
body.appendChild(loadingFullScreen);

videoBgContainer.style.display = 'none';





function cleanLoading()
{
  videoBgContainer.style.display = null;
  // loadingFullScreen.remove();
  const tmpBody = document.querySelector('body_temp');
  if (tmpBody) tmpBody.remove();
}

const initExtensionContext = () => {
  const navSearch = document.querySelector('.navbar-form.search_form');
  navSearch && navSearch.querySelector('input').classList.add('v__nav-search__input');

  const taskDetailTitle = document.querySelector("#task_view_detail .tittle-task");
  taskDetailTitle && taskDetailTitle.remove();

  const avatarE = document.querySelector('.avatar_img img');
  if (avatarE) {
    avatarE.src = 'https://hr.bssgroup.vn/files/thumbnail/avatar/150x150/312-5de8c77b365e62.10419078.png';
    avatarE.classList.add('user-avatar');
  }

  const peopleE = document.querySelector('.bc-view-pp-right');
  const targetNode = document.querySelector('.container.container_wrap');
  const rightContent = document.createElement('div');
  rightContent.classList.add('bc-view-pp-right__wrapper');

  videoBgContainer.classList.add('video-bg');
  videoBg.width = 320;
  videoBg.height = 240;
  videoBg.autoplay = true;
  videoBg.loop = true;
  videoBg.muted = true;
  videoBg.controls = false;
  videoBg.src = chrome.runtime.getURL("images/pms/bg-lightmode.mp4");

  let container = document.createElement("div");

  container.classList.add('content-container');
  if (targetNode) {
    targetNode.before(container);
    container.append(targetNode);
    container.before(videoBgContainer);
    targetNode.after(rightContent);
    rightContent.append(peopleE);
    videoBgContainer.append(videoBg);
  }

  const formAddCommentel = document.querySelector('#form_add_comment');
  if (formAddCommentel && peopleE) {
    const formAddCommentWrapper = document.createElement('div');
    //add 1 div chứa comment floating right
    formAddCommentWrapper.setAttribute('class', 'bc-view-pp-right');
    peopleE.after(formAddCommentWrapper);
    formAddCommentWrapper.appendChild(formAddCommentel);
  }

  //thêm class comment_item vào phần work_log
  var workLogWrapper = document.getElementsByClassName("bc-worklog-task");
  if (workLogWrapper && workLogWrapper[0]) {
      workLogList = Array.from(workLogWrapper[0].querySelectorAll(":scope > div"));
      // Sử dụng map để thêm class "item" vào mỗi thẻ con
      workLogList.map(function(workLogItem) {
        workLogItem.classList.add('comment_item');
      });
  }

  // const titleTaskE = document.querySelector('.tittle-task');
  const toolbar = document.querySelector('.pull-right.bc-pull-right-custom');
  // const getIsFloat = () => getComputedStyle(toolbar).getPropertyValue('position') !== 'fixed';
  // let isFloating = getIsFloat();
  // let toolbarOffsetTop = isFloating ? toolbar.offsetTop : titleTaskE.offsetTop;

  const newToolbarContainer = document.querySelector('.area_note');
  if (newToolbarContainer) {
    newToolbarContainer.append(toolbar);
  }

  const logtimePopup = document.querySelector('.log-time-popup');
  const updateTaskPopup = document.querySelector('.bc-comment-task .update-comment');
  const requestreviewPopup = document.querySelector('.bc-comment-task .requestreview-popup');
  if (logtimePopup) {
    logtimePopup.children[0].classList.remove('no-border');
    document.body.append(logtimePopup);
  }
  if (updateTaskPopup) {
    document.body.append(updateTaskPopup)
  }
  if (requestreviewPopup) {
    document.body.append(requestreviewPopup)
  }

  const backDashboards = document.querySelectorAll('.btn.btn-update.btn-back');
  backDashboards && backDashboards.forEach((backDashboard) => { backDashboard.remove() });

  const taskStatusDropdownEl = document.getElementById('update_status_task');
  let taskStatusWrapperEl;

  const newFixedWrapperEl = document.createElement('div');

  // Tạo 1 wrapper mới để bọc element task status, element này sẽ được dùng để fixed
  if (taskStatusDropdownEl) {
    taskStatusWrapperEl = taskStatusDropdownEl.closest('p');
    newFixedWrapperEl.append(taskStatusWrapperEl.children[0]);
    newFixedWrapperEl.append(taskStatusDropdownEl);
    taskStatusWrapperEl.append(newFixedWrapperEl);
    // ném status vào toolbar
    const toolbarDestination = (toolbar.offsetHeight - newFixedWrapperEl.offsetHeight) / 2;
    newFixedWrapperEl.style.position = 'fixed';
    newFixedWrapperEl.style.top = `${toolbarDestination}px`;
    newFixedWrapperEl.style.zIndex = '8888';
  }
  //focus search input
  // document.getElementById('search').addEventListener('focus', function () {
  //   const navBar = document.getElementById('navbar');
  //   navBar.classList.add('wide');
  // });

  //move message under navbar 
  const messageSuccessEl = document.querySelector('.alert-success');
  const messageDangerEl = document.querySelector('.alert-danger');
  if (messageSuccessEl) {
    const navBar = document.querySelector('.navbar-default');
    navBar.after(messageSuccessEl);
  }
  if (messageDangerEl) {
    const navBar = document.querySelector('.navbar-default');
    navBar.after(messageDangerEl);
  }

  cleanLoading();
  var tesss = new URLSearchParams(window.location.search);
  let foundReviewId = null;
  const COMMENT_REVIEW_PATTEN = /^requestreview([0-9]*)$/g;
  [...tesss.entries()].every(([key]) => {
    const a = [...key.matchAll(COMMENT_REVIEW_PATTEN)];
    if (!a?.length) return true;
    
    if(a[0]?.[1] !== undefined && a[0]?.[1] !== "") {
      foundReviewId = a[0][1];
      return false;
    }
    return true;
  });
  
  let scrollToViewEl;
  if (foundReviewId) {
    const reviewEl = document.querySelector(`.comment_item${foundReviewId}`);
    if (reviewEl) {
      scrollToViewEl = reviewEl.closest('.comment_item');
    }
  }
  if (scrollToViewEl) {
    scrollToViewEl.scrollIntoView({ behavior: "smooth", block: "end" });
  }
};

if (document.readyState !== 'loading') {
  console.log(document.readyState, 'PMS Toolbox Loaded!!!');
  if (ready) {
    initExtensionContext()
  } else {
    window.addEventListener('V_PMS_LOADED', initExtensionContext);
  }
  
} else {
  document.addEventListener('DOMContentLoaded', function () {
    console.log('PMS Toolbox Loaded!!!');
    if (ready) {
      initExtensionContext();
    } else {
      window.addEventListener('V_PMS_LOADED', initExtensionContext);
    }
    
    // initExtensionContext();
  });
}

function waitForElm(selector) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(mutations => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.querySelector('html'), {
      childList: true,
      subtree: true
    });
  });
}
waitForElm('head').then(el => {
  head = el;
  var link  = document.createElement('link');
  link.rel  = 'stylesheet';
  link.type = 'text/css';
  link.href = chrome.runtime.getURL("css/pms/main.css");
  link.media = 'all';
  link.onload = () => {
    // Do something interesting; the sheet has been loaded
    console.log('loadeddddd!!!');
    const body = document.querySelector('body');
    if (body) {
      hasBody = true;
    }
    ready = true;
    window.dispatchEvent(new CustomEvent('V_PMS_LOADED'));
  };
  head.appendChild(link);
});
waitForElm('body').then(el => {
  if (!hasBody) return;
  body = document.querySelector('body');
  // body.appendChild(loadingFullScreen);
});