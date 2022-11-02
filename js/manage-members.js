const pageSize =5;
let page =3;
getAllMembers();
function getAllMembers(query=`${$('#txt-search').val()}`){
    /* Step 1 --->Initiate a XMLHTTP request*/

const http = new XMLHttpRequest();



/* step 2 ---> set an event listner o detect state change*/

http.addEventListener('readystatechange',()=>{
    // console.log(http.readyState);
    /* can identify status using readystate instance property */
    if(http.readyState===http.DONE){
        if(http.status===200){
            const totalMembers =+http.getResponseHeader('X-Total-Count');
            initpagination(totalMembers);

            const members = JSON.parse(http.responseText);
            // console.log($('#loader'))
            // $('#loader').hide();
            if(members.length===0){
                $('#tbl-members').addClass('empty');
            }else{
                $('#tbl-members').removeClass('empty');
            }
            $('#tbl-members tbody tr').remove();
            members.forEach(member => {
                const rowHtml=`
                    <tr tabindex="0">
                        <td>${member.id}</td>
                        <td>${member.name}</td>
                        <td>${member.address}</td>
                        <td>${member.contact}</td>
                    </tr>
                `;
            $('#tbl-members tbody').append(rowHtml);
            });
        }else{
            $('#toast').show();
        }
    }

});

/* step-3 -->Open the requst */

http.open('GET',`http://localhost:8080/lms/api/members?size=${pageSize}&page=${page}&q=${query}`,true);  /* here true means assynchronous */

/* step-4 -->set additionl information for the request */


/* step-5 -> Send the request */

http.send();
}


function initpagination(totalMembers){
    const totalPages =Math.ceil(totalMembers/pageSize);
    if(totalPages<=1){
        $('#pagination').addClass('d-none');
    }else{
        $('#pagination').removeClass('d-none');
    }
    let html ='';
    for(let i =1;i<=totalPages;i++){
        html +=`<li class="page-item ${i===page?'active':''}"><a class="page-link" href="#">${i}</a></li>`

    }
     html =`
                <li class="page-item ${page===1?'disabled':''}"><a class="page-link" href="#">Previous</a></li>
                ${html}
                <li class="page-item ${page===totalPages?'disabled':''} "><a class="page-link" href="#">Next</a></li>
            `;
            $('#pagination >.pagination').html(html);
}

$('#pagination > .pagination').click((eventData)=>{
    const elm=eventData.target;
    if(elm && elm.tagName=='A'){
        const activePage =($(elm).text());

        if(activePage==='Next'){
            page++;
            getAllMembers();
        }else if(activePage==='Previous'){
            page--;
            getAllMembers();
        }else{
            if(page!=activePage){
                page=+activePage;
                getAllMembers();
            }
        }
    }
});

$('#txt-search').on('input',()=>{
    page=1;
    getAllMembers();
});


$('#tbl-members tbody').keyup((eventData)=>{
    if(eventData.which===38){
        const elm=document.activeElement.previousElementSibling;
        if(elm instanceof HTMLTableRowElement){
            elm.focus();
        }
    }else if(eventData.which===40){
        const elm=document.activeElement.nextElementSibling;
        if(elm instanceof HTMLTableRowElement){
            elm.focus();
        }
    }
})

$(document).keydown((eventData)=>{
    if(eventData.ctrlKey && eventData.key ==='/'){
        $('#txt-search').focus();
    }
});