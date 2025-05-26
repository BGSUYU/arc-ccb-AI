import puppeteer from 'puppeteer'

// 爬取的URL:https://m.prts.wiki/w/%E5%B9%B2%E5%91%98%E4%B8%80%E8%A7%88
const url = 'https://m.prts.wiki/w/%E5%B9%B2%E5%91%98%E4%B8%80%E8%A7%88'

//分析Html页面信息（puppeteer可以有axios以及cheerio的作用 主要用于抓取动态如：Vue和React的页面）
export async function fetchPage(): Promise<void> {
    const Itemsname: string[] = [];//用于拼接姓名的所有数据
    const ItemsSubProfession: string[] = [];//用于拼接干员的子职业
    const ItemsPower: string[] = [];//用于拼接干员的势力
    const ItemsRace: string[] = [];//用于拼接干员的种族
    const ItemsBirthPlace: string[] = [];//用于拼接干员的出生地
    const ItemsSex: string[] = [];//用于拼接干员的性别
    const ItemsPosition: string[] = [];//用于拼接干员的位置
    const ItemsObtain:string[]=[];//用于拼接干员获取方式
    const ItemsTag:string[]=[];//用于拼接干员的标签
    const ItemsFeature:string[]=[];//用于拼接干员的特性
    const allItems = {
      name:Itemsname,
      SubProfession:ItemsSubProfession,
      Power:ItemsPower,
      BirthPlace:ItemsBirthPlace,
      Race:ItemsRace,
      Sex:ItemsSex,
      Position:ItemsPosition,
      Obtain:ItemsObtain,
      Tag:ItemsTag,
      Feature:ItemsFeature,
    }
    
    let pageIndex = 1; //抓取页数索引

    puppeteer.launch()
    .then(async browser => {

    const page = await browser.newPage();
    await page.goto(url,{ waitUntil: 'networkidle0' });

    // 其他操作...

      while(true){

        await page.waitForSelector('#filter-result .short-container');//干员的基础信息 使用outerHTML可以获得下一级的信息（即比较详细） 如果直接使用textContent会直接获得文本 且当渲染到这时即可使用其子元素

        // const appHtml:string = await page.$eval('.paginations-container .checkbox-container[data-v-7bc26d06=""]', (el: Element) => el.outerHTML|| '');

        const prevText:string[] =await page.$$eval ('#filter-result .short-container',elements => elements.map(el => el.outerHTML|| ''));
        const name:string[] = await page.$$eval('#filter-result .short-container .name [data-v-81ebf6dc=""] a',elements => elements.map(el => el.textContent?.trim()|| ''))//获取角色姓名（中文）
        const camp:string[] = await page.$$eval('#filter-result .short-container .camp [data-v-81ebf6dc=""] [data-v-81ebf6dc=""]',elements => elements.map(el => el.textContent?.trim()|| ''))//获取干员的子职业、势力、出生地、种族
        const hp:string[] = await page.$$eval('#filter-result .short-container .data .hp',elements => elements.map(el => el.textContent?.trim()|| '')) //攻击力
        const atk:string[] = await page.$$eval('#filter-result .short-container .data .atk',elements => elements.map(el => el.textContent?.trim()|| '')) //生命值
        const def:string[] = await page.$$eval('#filter-result .short-container .data .def',elements => elements.map(el => el.textContent?.trim()|| '')) //防御力
        const res:string[] = await page.$$eval('#filter-result .short-container .data .res',elements => elements.map(el => el.textContent?.trim()|| '')) //法术抗性
        const sex:string[] = await page.$$eval('#filter-result .short-container .sex',elements => elements.map(el => el.textContent?.trim()|| '')) //性别
        const position:string[] = await page.$$eval('#filter-result .short-container .position',elements => elements.map(el => el.textContent?.trim()|| '')) //位置
        const obtain:string[] = await page.$$eval('#filter-result .short-container .obtain',elements => elements.map(el => el.textContent?.trim()|| ''))//获取方式
        const tag:string[] = await page.$$eval('#filter-result .short-container .tag',elements => {
          return elements.map(element =>{
            const clone = element.cloneNode(true) as HTMLElement
            clone.querySelectorAll('.sex,.position').forEach(el=>el.remove());
            return clone.textContent?.trim()||'';
          })
        }) //标签 通过使用querySelector以及cloneNode去移除.sex .position标签
        const feature:string[] = await page.$$eval('#filter-result .short-container .feature',elements => elements.map(el => el.textContent?.trim()|| ''))//获取特性

        // console.log('动态渲染的 app HTML:', tag); //测试输出数据

        // console.log(`第 ${pageIndex} 页`); //测试当前页数

        Itemsname.push(...name);//获取姓名
        ItemsSex.push(...sex);//获取性别
        ItemsPosition.push(...position);//获取生命值
        ItemsObtain.push(...obtain)//获取方式
        ItemsTag.push(...tag)//标签
        ItemsFeature.push(...feature)//特性


        for(let i= 0; i < camp.length/4; i++){
          ItemsSubProfession.push(camp[i*4]);//获取子职业
          ItemsPower.push(camp[i*4+1]);//获取势力
          ItemsBirthPlace.push(camp[i*4+2]);//获取出生地
          ItemsRace.push(camp[i*4+3]);//获取种族
        }//此循环用于拼接camp信息

        const nextPageDiv = await page.$(`.paginations-container .checkbox-container:nth-child(${pageIndex + 1})`) //设置需要点击的元素
        if (!nextPageDiv) {
        break;
        }

        //<div data-v-81ebf6dc="" class="name"><div data-v-81ebf6dc=""><a data-v-81ebf6dc="" href="https://prts.wiki/w/安德切尔"><div data-v-81ebf6dc="">安德切尔</div></a><div data-v-81ebf6dc="">Adnachiel</div><div data-v-81ebf6dc="">アドナキエル</div><div data-v-81ebf6dc="">PA44</div></div></div><div data-v-81ebf6dc="" class="camp"><div data-v-81ebf6dc=""><div data-v-81ebf6dc="">速射手</div><div data-v-81ebf6dc="">罗德岛-行动预备组A4</div><div data-v-81ebf6dc="">拉特兰</div><div data-v-81ebf6dc="">萨科塔</div></div></div><div data-v-81ebf6dc="" class="data"><div data-v-81ebf6dc="" class="hp">1080</div><div data-v-81ebf6dc="" class="atk">365</div><div data-v-81ebf6dc="" class="def">134</div><div data-v-81ebf6dc="" class="res">0</div></div><div data-v-81ebf6dc="" class="property"><div data-v-81ebf6dc="" class="re_deploy">70s</div><div data-v-81ebf6dc="" class="cost">11</div><div data-v-81ebf6dc="" class="block">1</div><div data-v-81ebf6dc="" class="interval">1.0s</div></div><div data-v-81ebf6dc="" class="obtain"><div data-v-81ebf6dc="">公开招募</div><div data-v-81ebf6dc="">主线剧情</div></div><div data-v-81ebf6dc="" class="tag"><div data-v-81ebf6dc="" class="sex">男</div><div data-v-81ebf6dc="" class="position">远程位</div><div data-v-81ebf6dc="">输出</div></div><div data-v-81ebf6dc="" class="feature"><div data-v-81ebf6dc=""><div data-v-2d7b39ca="">优先攻击空中单位</div></div></div></div>'
        await nextPageDiv.click(),
        // 触发点击

        await page.waitForFunction((oldText) => {
          const newText = document.querySelector('#filter-result .short-container')?.innerHTML;
          return newText && newText !== oldText;
        }, {}, prevText as unknown as string);//通过对比旧文本和新文本能够获得信息

        pageIndex++;
        
      }
        await browser.close();
        console.log(allItems);//测试总体数据是否正确
        return allItems;
    }
  )    
} // 爬取页面(使用Promise封装了axios.get方法) 改进使用puppeteer（动态渲染）

// fetchPage() //函数测试
// const data = await fetchPage() //获取data的方式