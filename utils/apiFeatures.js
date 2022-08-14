const shopSchema = require("../models/shopModel");

class ApiFeatures{
    constructor(query,queryStr){
        this.query=query;
        this.queryStr=queryStr
    }
    search(){
        const keyword=this.queryStr.keyword?{
            name:{
                $regex:this.queryStr.keyword,
                $options:"i",
            }
        }:{};
        const categoryKeyword=this.queryStr.keyword?{
            categories:{
                $regex:this.queryStr.keyword,
                $options:"i",
            }
        }:{};
        // const descriptionKeyword=this.queryStr.keyword?{
        //     description:{
        //         $regex:this.queryStr.keyword,
        //         $options:"i",
        //     }
        // }:{};

        // console.log(shopSchema.find({...keyword}).explain("executionStats"))

        this.query=this.query.find({$or:[{...keyword},{...categoryKeyword}]})
        // this.query=this.query.find({$or:[{...keyword},{...categoryKeyword},{...descriptionKeyword}]})

        // this.query=this.query.find({$or:[{...keyword},{categories:{  $regex:this.queryStr.keyword, $options:"i",}}]})
    
                return this;
    }

    filter(){
     
        const categoryKeyword=this.queryStr.category?{
            categories:{
                $in:this.queryStr.category,
                // $options:"i",
            }
        }:{};
     
        const shopStatus=this.queryStr.shopStatus?{
            shopStatus:{
                $eq:this.queryStr.shopStatus,
            }
        }:{};
        // console.log({...shopStatus},{...categoryKeyword})
        this.query=this.query.find({$and:[{...shopStatus},{...categoryKeyword}]})
        // this.query=this.query.find({...categoryKeyword})
        // this.query=this.query.find({...shopStatus})
       
        
       
        return this;
    }
 
    pagination(){
       
        const pageSize=Number(this.queryStr.pageSize)||5;
        const currentPage=Number(this.queryStr.page)||1;

        const skip=pageSize*(currentPage-1);
        this.query=this.query.limit(pageSize).skip(skip);
        return this;

    }
};

module.exports=ApiFeatures