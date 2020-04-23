$(document).ready(function () {

    initData();

    var locationPicker = document.getElementById('locationPicker');
    var locationValue = '';
    var cardPerPage = '';
    locationPicker.addEventListener('click', (e) => {
        document.querySelector('.dropbox').classList.toggle('active');
    })

    locationPicker.addEventListener('change', (e) => {
        locationValue = locationPicker.value;
        $('.travelTitle').fadeOut(700);
        setTimeout(()=>{
        $('.travelTitle').html(locationValue);
        },700)
        $('.travelTitle').fadeIn(700);
        selectDropData(locationValue);
    })


    $(document).on('click','.card', function(){
        $(this).toggleClass('active')
    })

    currentPage = 0;

    $(document).on('click', '.page-link', function (e) {
        e.preventDefault();
        
        var clickPage = parseInt(e.target.dataset.num);
        if(clickPage) {
            currentPage = clickPage;
        }
        var value = $(this).attr('aria-label');
        changePageData(clickPage);
        $(this).parent().addClass('active');
        $(this).parent().siblings().removeClass('active');
        var totalPage = $(this).parent().siblings().length -2;
        if(value == 'Next') {
            if(currentPage < totalPage) {
                currentPage+=1;
            } else {
                currentPage = currentPage;
            }
            console.log(currentPage)

            $(this).parent().removeClass('active');
            $('a[data-num="'+currentPage+'"]').parent().addClass('active');
            changePageData(currentPage);

        } else if(value == 'Previous'){
            if(currentPage>0) {
                currentPage-=1;
            } else {
                currentPage = currentPage;
            }
            $(this).parent().removeClass('active');
            $('a[data-num="'+currentPage+'"]').parent().addClass('active');
            changePageData(currentPage);

        }

    })

    $(document).on('click','.popularItem',function(){
        var value = $(this).data('location');
        $('.travelTitle').fadeOut(700);
        setTimeout(()=>{
        $('.travelTitle').html(value);
        },700)
        $('.travelTitle').fadeIn(700);
        selectDropData(value);
    })

});


var rawData = '';
const initData = () => {
    var requestURL = 'https://data.kcg.gov.tw/api/action/datastore_search?resource_id=92290ee5-6e61-456f-80c0-249eae2fcc97&q=';
    var request = new XMLHttpRequest();
    request.open('GET', requestURL);
    request.responseType = 'json';
    request.send();

    request.onload = function () {
        var superHeroes = request.response;
        rawData = superHeroes.result.records;
        sortingData(rawData);
        initList(rawData);
    }
}

var newData = [];
const selectDropData = locationValue => {
    newData = [];
    var nav= '';
    for (const i in rawData) {
        if (rawData.hasOwnProperty(i)) {
            const e = rawData[i];
            if (e.Zone == locationValue) {
                newData.push(e);
            }
        }
    }

    var pageTotal;
    var pageCal = newData.length / 10;

    if (pageCal % 1 < 1 && pageCal % 1 != 0) {
        pageTotal = parseInt(pageCal) + 1;
    } else {
        pageTotal = pageCal;
    }

    nav += `<nav aria-label="Page navigation" class="paginationDiv">
    <ul class="pagination">
      <li class="page-item">
        <a class="page-link" href="#" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>`;

      if(pageTotal > 1) {
        nav += `<li class="page-item active"><a class="page-link" href="#" data-num=0>1</a></li>`
        for (let j = 1; j < pageTotal; j++) {
            nav += `<li class="page-item"><a class="page-link" href="#" data-num=${j}>${j+1}</a></li>`
        }
      } else {
        for (let j = 1; j < pageTotal + 1; j++) {
            nav += `<li class="page-item"><a class="page-link" href="#" data-num=${j}>${j}</a></li>`
        }
      }

    
    nav += `<li class="page-item">
                    <a class="page-link" href="#" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                    </a>
                </>
                </ul>
            </nav>`;

    document.querySelector('.pageContainer').innerHTML = nav;

    updateList(newData);
    currentPage = 0;
    
}

var pageTotal;
const changePageData = onPageNum => {
    if (onPageNum != 0) {
        onPageNum = onPageNum * 10;
    }
    var dataNum = onPageNum + 10;

    var newData2 = newData.slice(onPageNum, dataNum);

    updateList(newData2);

}



const updateList = (newData) => {
    var str = '';

    if (newData.length < 10) {
        onepageCard = newData.length;
    } else {
        onepageCard = 10;
    }

    for (let i = 0; i < onepageCard; i++) {
        const e = newData[i];
        str += `<div class="card travelPoints">
        <img class="card-img-top point_img" src="${e.Picture1}" alt="Card image cap">
        <div class="card-body">
          <div class="point_openingTime card-body-flex"><i class="fas fa-clock"></i><span>${e.Opentime}</span></div>
          <div class="point_address card-body-flex"> <i class="fas fa-map-marker-alt"></i><span>${e.Add}</span> </div>
          <div class="point_contact card-body-flex"><i class="fas fa-mobile-alt"></i><span>${e.Tel}</span></div>`;

        if (e.Ticketinfo != '') {
            str += `<div class="point_tag"><i class="fas fa-tag"></i>${e.Ticketinfo}</div>`;
        }

        str += `</div></div>`;
    }


    $('.travelData').addClass('cardOut');

    setTimeout(() => {
        document.querySelector('.travelData').innerHTML = str;
        $('.travelData').removeClass('cardOut');

    }, 800);


    
}



const sortingData = (rawData) => {

    zone = rawData.map(data => {
        return data.Zone;
    })

    getZoneList = zone.reduce((init, current) => {
        if (init.length === 0 || init[init.length - 1] !== current) {
            init.push(current);
        }
        return init
    }, [])

    //Reduce to get the popular choice location
    popularZone = zone.reduce((allLocation, currentLocation) => {
        if (allLocation.hasOwnProperty(currentLocation)) {
            allLocation[currentLocation]++
        } else {
            allLocation[currentLocation] = 1;
        }
        return allLocation;
    }, {});

    //Sorting top travel place
    popularRanking = [];
    for (var rank in popularZone) {
        popularRanking.push([rank, popularZone[rank]]);
    }
    popularRanking.sort((a, b) => b[1] - a[1]);
    updateSelectBox(popularRanking);
    updatePopularChoice(popularRanking);


}

const updateSelectBox = (popularRanking) => {
    var str = '';
    for (let i = 0; i < popularRanking.length; i++) {
        const e = popularRanking[i];
        str += `<option value="${e[0]}">${e[0]} 
        &nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp&nbsp
        ${e[1]}筆資料</option>`;
    }
    $('#locationPlaceHolder').after(str);
}

const updatePopularChoice = (popularRanking) => {
    var color = ['#8a82cc', '#ffa782', '#F5D105', '#559AC8', '#e1f8dc', '#ACDDDE', '#CAF1DE'];
    var str = '';
    for (let i = 0; i < 5; i++) {
        const e = popularRanking[i];
        str += `<li class="popularItem popularItem${i}" data-location="${e[0]}">${e[0]}</li>`;
    }
    $('.popularList').html(str)

    //Made a new array to reorder color in order to show the color randomly every refresh
    var randomColor = color.sort(() => {
        return 0.5 - Math.random()
    })
    for (let j = 0; j < color.length; j++) {
        $('.popularItem' + j).css({
            'background-color': randomColor[j]
        })

    }

}


// Initial the original info of the web
const initList = (rawData) => {
    var str = '';
    var nav = '';
    var pageCal = rawData.length / 10;
    var onepageCard = '';

    // 看是否一個頁面有超過10筆的資料 如果有就10筆
    if (rawData.length < 10) {
        onepageCard = rawData.length;
    } else {
        onepageCard = 10;
    }

    for (let i = 0; i < onepageCard; i++) {
        const e = rawData[i];
        str += `<div class="card travelPoints">
        <img class="card-img-top point_img" src="${e.Picture1}" alt="Card image cap">
        <div class="card-body">
          <div class="point_openingTime card-body-flex"><i class="fas fa-clock"></i><span>${e.Opentime}</span></div>
          <div class="point_address card-body-flex"> <i class="fas fa-map-marker-alt"></i><span>${e.Add}</span> </div>
          <div class="point_contact card-body-flex"><i class="fas fa-mobile-alt"></i><span>${e.Tel}</span></div>`;

        if (e.Ticketinfo != '') {
            str += `<div class="point_tag"><i class="fas fa-tag"></i>${e.Ticketinfo}</div>`;
        }

        str += `<div class="point_description">${e.Description}</div></div></div>`;
    }

    if (pageCal % 1 < 1 && pageCal % 1 != 0) {
        pageTotal = parseInt(pageCal) + 1;
    } else {
        pageTotal = pageCal;
    }

    console.log(pageTotal)
    nav += `<nav aria-label="Page navigation" class="paginationDiv">
    <ul class="pagination">
      <li class="page-item">
        <a class="page-link" href="#" aria-label="Previous">
          <span aria-hidden="true">&laquo;</span>
        </a>
      </li>`;
      nav += `<li class="page-item active"><a class="page-link" href="#" data-num=0>1</a></li>`

    for (let j = 1; j < pageTotal; j++) {
        nav += `<li class="page-item"><a class="page-link" href="#" data-num=${j}>${j+1}</a></li>`
    }
    nav += `<li class="page-item">
                    <a class="page-link" href="#" aria-label="Next">
                    <span aria-hidden="true">&raquo;</span>
                    </a>
                </>
                </ul>
            </nav>`;
    document.querySelector('.travelData').innerHTML = str;
    document.querySelector('.pageContainer').innerHTML = nav;


    // Initial data store to modify data array
    newData = rawData;

}