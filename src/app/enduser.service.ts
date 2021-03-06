import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';

@Injectable()
export class EndUserService {

  constructor(private sharedService: SharedService) { }

  
  ////////////////////////////////////////SEARCH/////////////////////////////////////////////////
  search(term,city,location,type){
	  return this.sharedService.call('search/?city='+city+'&location='+location+'&type='+type+'&term='+term, "get", null, false);
  }
  searchload(queries,type,city,location,sale,buy,bid,service,userFilter){
	  var obj = {queries: queries, type: type, city: city, location: location, sale:sale, buy:buy, bid:bid, service:service, userFilter:userFilter};
	  return this.sharedService.call('searchload', "post", obj, false);
  }
  searchLoc(term){
	  return this.sharedService.call('searchLoc/?term='+term, "get", null, false);
  }
  
  
  ////////////////////////////////////////USER ADDRESS/////////////////////////////////////////////////
  getAddress(user_id,address_id){
	  return this.sharedService.call('userAddress/?user_id='+user_id+'&address_id='+address_id, "get", null, false);
  }
  
  addAddress(newAddress){
	  return this.sharedService.call('userAddress', "post", newAddress, false);
  }
  
  updateAddress(userAddress){
	  return this.sharedService.call('userAddress', "put", userAddress, false);
  }
  
  
  
  
  ////////////////////////////////////////USER ALERT/////////////////////////////////////////////////
  getAlert(user_id,alert_id){
	  return this.sharedService.call('userAlert/?user_id='+user_id+'&alert_id='+alert_id, "get", null, false);
  }
  
  addAlert(newAlert){
	  return this.sharedService.call('userAlert', "post", newAlert, false);
  }
  
  updateAlert(userAlert){
	  return this.sharedService.call('userAlert', "put", userAlert, false);
  }
  
  
  
  
  ////////////////////////////////////////USER SUBSCRIPTION/////////////////////////////////////////////////
  getSubscription(user_id,subscription_id){
	  return this.sharedService.call('userSubMap/?user_id='+user_id+'&subscription_id='+subscription_id, "get", null, false);
  }
  
  buySubscription(newSubscription){
	  return this.sharedService.call('buySubscription', "post", newSubscription, false);
  }
  
  addSubscription(newSubscription){
	  return this.sharedService.call('userSubMap', "post", newSubscription, false);
  }
  
  updateSubscription(userSubscription){
	  return this.sharedService.call('userSubMap', "put", userSubscription, false);
  }
  
  
  ////////////////////////////////////////FAVOURITE/////////////////////////////////////////////////
  getFav(user_id,bid_sell_buy_id){
	  return this.sharedService.call('fav/?user_id='+user_id+'&bid_sell_buy_id='+bid_sell_buy_id, "get", null, false);
  }
  
  addFav(newItem){
	  return this.sharedService.call('fav', "post", newItem, false);
  }
  
  updateFav(item){
	  return this.sharedService.call('fav', "put", item, false);
  }
  
  deleteFav(item){
	  return this.sharedService.call('fav/'+item._id, "delete", null, false);
  }
  
  
  
  ////////////////////////////////////////SELL/////////////////////////////////////////////////
  getSell(user_id,sell_id,city,count,skip,limit){
	  return this.sharedService.call('sell/?user_id='+user_id+'&sell_id='+sell_id+'&city='+city+'&count='+count+'&skip='+skip+'&limit='+limit, "get", null, false);
  }
  
  addSell(newSell){
	  return this.sharedService.call('sell', "post", newSell, false);
  }
  
  updateSell(sell){
	  return this.sharedService.call('sell', "put", sell, false);
  }
  
  deleteSell(sell_id){
    return this.sharedService.call('sell/'+sell_id, "delete", null, false);
  }
    
  
  
  ////////////////////////////////////////BUY/////////////////////////////////////////////////
  getBuy(user_id,buy_req_id,city,count,skip,limit){
	  return this.sharedService.call('buy/?user_id='+user_id+'&buy_req_id='+buy_req_id+'&city='+city+'&count='+count+'&skip='+skip+'&limit='+limit, "get", null, false);
  }
  
  addBuy(newBuy){
	  return this.sharedService.call('buy', "post", newBuy, false);
  }
  
  updateBuy(buy){
	  return this.sharedService.call('buy', "put", buy, false);
  }
  
  deleteBuy(buy_req_id){
    return this.sharedService.call('buy/'+buy_req_id, "delete", null, false);
  }
      
  
  
  ////////////////////////////////////////BID/////////////////////////////////////////////////
  getBid(user_id,bid_id,city,count,skip,limit){
	  return this.sharedService.call('bid/?user_id='+user_id+'&bid_id='+bid_id+'&city='+city+'&count='+count+'&skip='+skip+'&limit='+limit, "get", null, false);
  }
  
  addBid(newBid){
	  return this.sharedService.call('bid', "post", newBid, false);
  }
  
  updateBid(bid){
	  return this.sharedService.call('bid', "put", bid, false);
  }
  
  deleteBid(bid_id){
    return this.sharedService.call('bid/'+bid_id, "delete", null, false);
  }
  
  
  ////////////////////////////////////////Thumbnail/////////////////////////////////////////////////
  getThumbnail(user_id,transaction_id){
	  return this.sharedService.call('thumbnail/?user_id='+user_id+'&transaction_id='+transaction_id, "get", null, false);
  }
  
  addThumbnail(newThumbnail){
	  return this.sharedService.call('thumbnail', "post", newThumbnail, false);
  }
  
  updateThumbnail(thumbnail){
	  return this.sharedService.call('thumbnail', "put", thumbnail, false);
  }
  
  getThumbnailIndicator(user_id,transaction_id){
	  return this.sharedService.call('thumbnailIndicator/?user_id='+user_id+'&transaction_id='+transaction_id, "get", null, false);
  }
  
   ////////////////////////////////////////Image/////////////////////////////////////////////////
  getImage(user_id,image_id,transaction_id){
	  return this.sharedService.call('image/?user_id='+user_id+'&image_id='+image_id+'&transaction_id='+transaction_id, "get", null, false);
  }
  
  addImage(newImage){
	  return this.sharedService.call('image', "post", newImage, false);
  }
  
  updateImage(image){
	  return this.sharedService.call('image', "put", image, false);
  }
  
  ////////////////////////////////////////BID BY/////////////////////////////////////////////////
  getBidBy(bid_by_user_id,bid_id){
	  return this.sharedService.call('bidBy/?bid_by_user_id='+bid_by_user_id+'&bid_id='+bid_id, "get", null, false);
  }
  
  addBidBy(newBidBy){
	  return this.sharedService.call('bidBy', "post", newBidBy, false);
  }
  
  updateBidBy(bidBy){
	  return this.sharedService.call('bidBy', "put", bidBy, false);
  }
  
  
  
  ////////////////////////////////////////Filter/////////////////////////////////////////////////
  getFilter(user_id){
	  return this.sharedService.call('filter/?user_id='+user_id, "get", null, false);
  }
  
  addFilter(newFilter){
	  return this.sharedService.call('filter', "post", newFilter, false);
  }
  
  updateFilter(filter){
	  return this.sharedService.call('filter', "put", filter, false);
  }
  
  deleteMultipleFilter(user_id){
	  return this.sharedService.call('filterDelete', "put", {user_id: user_id}, false);
  }
  
  
    ////////////////////////////////////////SERVICE/////////////////////////////////////////////////
  getService(user_id,service_id,city,count,skip,limit){
	  return this.sharedService.call('service/?user_id='+user_id+'&service_id='+service_id+'&city='+city+'&count='+count+'&skip='+skip+'&limit='+limit, "get", null, false);
  }
  
  addService(newService){
	  return this.sharedService.call('service', "post", newService, false);
  }
  
  updateService(service){
	  return this.sharedService.call('service', "put", service, false);
  }
  
  deleteService(service_id){
    return this.sharedService.call('service/'+service_id, "delete", null, false);
  }
  
  
    ////////////////////////////////////////RATING/////////////////////////////////////////////////
  getRating(user_id,service_id){
	  return this.sharedService.call('rating/?user_id='+user_id+'&service_id='+service_id, "get", null, false);
  }
  
  addRating(newRating){
	  return this.sharedService.call('rating', "post", newRating, false);
  }
  
  updateRating(rating){
	  return this.sharedService.call('rating', "put", rating, false);
  }
  
  
  
  
  ////////////////////////////////////////FEEDBACK/////////////////////////////////////////////////
  getFeedback(user_id,service_id){
	  return this.sharedService.call('feedback/?user_id='+user_id+'&service_id='+service_id, "get", null, false);
  }
  
  addFeedback(newFeedback){
	  return this.sharedService.call('feedback', "post", newFeedback, false);
  }
  
  updateFeedback(feedback){
	  return this.sharedService.call('feedback', "put", feedback, false);
  }
  
  
  
  ////////////////////////////////////////THUMBSUP/////////////////////////////////////////////////
  getThumbsUp(user_id,service_id,feedback_id){
	  return this.sharedService.call('thumbs_up/?createdBy='+user_id+'&service_id='+service_id+'&feedback_id='+feedback_id, "get", null, false);
  }
  
  addThumbsUp(newThumbsUp){
	  return this.sharedService.call('thumbs_up', "post", newThumbsUp, false);
  }
  
  updateThumbsUp(thumbs_up){
	  return this.sharedService.call('thumbs_up', "put", thumbs_up, false);
  }
  
  ////////////////////////////////////////THUMBSDOWN/////////////////////////////////////////////////
  getThumbsDown(user_id,service_id,feedback_id){
	  return this.sharedService.call('thumbs_down/?createdBy='+user_id+'&service_id='+service_id+'&feedback_id='+feedback_id, "get", null, false);
  }
  
  addThumbsDown(newThumbsDown){
	  return this.sharedService.call('thumbs_down', "post", newThumbsDown, false);
  }
  
  updateThumbsDown(thumbs_down){
	  return this.sharedService.call('thumbs_down', "put", thumbs_down, false);
  }
  
  //////////////////////////////////////////CHAT///////////////////////////////////////////////////////////
  getChatInbox(user,post_id){
	  return this.sharedService.call('chatInbox/?from_user='+user+'&to_user='+user+'&post_id='+post_id, "get", null, false);
  }
  getChatDetail(chat_id,from_user,to_user){
	  return this.sharedService.call('chatDetail/?chat_id='+chat_id+'&from_user='+from_user, "get", null, false);
  }
  
  sendChat(chat){
	  return this.sharedService.call('chatDetail', "post", chat, false);
  }
  deleteChatInbox(chat_id){
	 return this.sharedService.call('chatInbox/'+chat_id, "delete", null, false);
  }
  getNewChatCount(){
	  return this.sharedService.call('freshChatCount', "get", null, false);
  }
  
}
