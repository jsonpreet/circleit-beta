import Deso from "deso-protocol";

class DesoApi {
  constructor() {
    this.client = null;
  }

  /* ======== Get Single Profile ========= */

  async getSingleProfile(publickey58) {
    if (!publickey58) {
      console.log("Publickey  is required");
      return;
    }
    const request = {
      PublicKeyBase58Check: publickey58,
    };
    try {
      const response = await this.getClient().user.getSingleProfile(request);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /* =========== Get single profile by username ========== */

  async getSingleProfileByUsername(user) {
    if (!user) {
      console.log("User  is required");
      return;
    }
    const request = {
      Username: user,
    };
    try {
      const response = await this.getClient().user.getSingleProfile(request);
      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /* ======= Get Single Post ========= */

  async getSinglePost(
    postHash,
    user,
    commentLimit = 25,
    commentOffset = 0,
    addGlobalFeedBool = false
  ) {
    let currentUser;
    if (!postHash) {
      console.log("Post hash needed.");
      return;
    }
    if (user) {
      currentUser = user;
    } else {
      currentUser = "";
    }
    const request = {
      PostHashHex: postHash,
      CommentLimit: commentLimit,
      CommentOffset: commentOffset,
      AddGlobalFeedBool: addGlobalFeedBool,
      ReaderPublicKeyBase58Check: currentUser,
    };
    try {
      const response = await this.getClient().posts.getSinglePost(request);

      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /* ======= Get Single Post with user ========= */

  async getSinglePostWithUser(
    postHash,
    user,
    commentLimit = 25,
    commentOffset = 0,
    addGlobalFeedBool = false
  ) {
    if (!postHash) {
      console.log("Post hash needed");
      return;
    }
    const request = {
      PostHashHex: postHash,
      CommentLimit: commentLimit,
      CommentOffset: commentOffset,
      AddGlobalFeedBool: addGlobalFeedBool,
      ReaderPublicKeyBase58Check: user,
    };
    try {
      const response = await this.getClient().posts.getSinglePost(request);

      return response;
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  /* ======= Upload Image ======== */
  async uploadImage(user, JWT, result) {
    if (!result) {
      console.log("Result needed");
      return;
    }
    const request = {
      UserPublicKeyBase58Check: user,
      JWT: JWT,
      file: result,
    };
    const response = await this.getClient().media.uploadImage(request);
    return response;
  }

  /* ========= Send messages ====== */

  async sendMessage(publickey58, text, img, link) {
    let ImageSend;
    if (!publickey58) {
      console.log("Public key required");
      return;
    }
    if (img == null) {
      ImageSend = [];
    } else {
      ImageSend = [img];
    }
    const request = {
      UpdaterPublicKeyBase58Check: publickey58,
      BodyObj: {
        Body: text,
        VideoURLs: [],
        ImageURLs: ImageSend,
      },
      PostExtraData: {
        App: "Eva",
        EmbedVideoURL: link,
      },
    };
    try {
      const response = await this.getClient().posts.submitPost(request);
      return response;
    } catch (error) {
      return error;
    }
  }
  async addToCommunityList(key, username, bio, fr, pic, banner, list) {
    if (!key) {
      console.log("Key is required");
      return;
    }
    if (!username) {
      alert("Username cannot be empty");
      return;
    }

    try {
      const request = {
        ProfilePublicKeyBase58Check: "",
        UpdaterPublicKeyBase58Check: key,
        NewUsername: username,
        NewDescription: bio,
        NewCreatorBasisPoints: fr,
        MinFeeRateNanosPerKB: 1000,
        NewStakeMultipleBasisPoints: 12000,
        NewProfilePic: pic,
        ExtraData: {
          CommunityList: list,
          FeaturedImageURL: banner,
        },
      };

      const response = await this.getClient().social.updateProfile(request);
      return response;
    } catch (error) {
      return error;
    }
  }

  async createCommunity(publickey58) {
    const request = {
        ProfilePublicKeyBase58Check: "",
        UpdaterPublicKeyBase58Check: publickey58,
        MinFeeRateNanosPerKB: 1000,
        NewStakeMultipleBasisPoints: 12500,
        ExtraData: {
          CircleIt: 'community',
        },
      };
    try {
      const response = await this.getClient().social.updateProfile(request);
      if(response && response.TxnHashHex !== undefined){
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return error;
    }
  }

  /* ========= Edit a message ====== */

  async editMessage(publickey58, text, img, link, post) {
    let ImageSend;
    if (!publickey58) {
      console.log("Public key required");
      return;
    }
    if (img == null) {
      ImageSend = [];
    } else {
      ImageSend = [img];
    }
    const request = {
      UpdaterPublicKeyBase58Check: publickey58,
      PostHashHexToModify: post,
      BodyObj: {
        Body: text,
        VideoURLs: [],
        ImageURLs: ImageSend,
      },
      PostExtraData: {
        App: "Eva",
        EmbedVideoURL: link,
        Edited: "true",
      },
    };
    try {
      const response = await this.getClient().posts.submitPost(request);
      return response;
    } catch (error) {
      alert(error);
    }
  }

  /* ========= Send Quote ====== */

  async sendQuote(publickey58, text, img, link, repost) {
    let ImageSend;
    if (img == null) {
      ImageSend = [];
    } else {
      ImageSend = [img];
    }
    if (!publickey58) {
      console.log("Public key required");
      return;
    }
    if (!text) {
      console.log("Text required");
      return;
    }
    const request = {
      UpdaterPublicKeyBase58Check: publickey58,
      BodyObj: {
        Body: text,
        VideoURLs: [],
        ImageURLs: ImageSend,
      },
      PostExtraData: {
        App: "Eva",
        EmbedVideoURL: link,
      },
      RepostedPostHashHex: repost,
    };
    const response = await this.getClient().posts.submitPost(request);
    return response;
  }

  /* ========= Send Comment ====== */

  async sendComment(publickey58, text, img, comment, link) {
    let ImageSend;
    if (img == null) {
      ImageSend = [];
    } else {
      ImageSend = [img];
    }
    if (!publickey58) {
      console.log("Public key required");
      return;
    }
    if (!text) {
      console.log("Text required");
      return;
    }
    const request = {
      UpdaterPublicKeyBase58Check: publickey58,
      ParentStakeID: comment,
      BodyObj: {
        Body: text,
        VideoURLs: [],
        ImageURLs: ImageSend,
      },
      PostExtraData: {
        App: "Eva",
        EmbedVideoURL: link,
      },
    };
    const response = await this.getClient().posts.submitPost(request);
    return response;
  }
  /* ========= Make New Post ====== */
  async newPost(publickey58, text, img, link) {
    let ImageSend;
    if (img == null) {
      ImageSend = [];
    } else {
      ImageSend = [img];
    }
    if (!publickey58) {
      console.log("Public key required");
      return;
    }
    if (!text) {
      console.log("Text required");
      return;
    }
    const request = {
      UpdaterPublicKeyBase58Check: publickey58,
      ParentStakeID: "",
      BodyObj: {
        Body: text,
        VideoURLs: [],
        ImageURLs: ImageSend,
      },
      PostExtraData: {
        App: "CircleIt",
        EmbedVideoURL: link,
      },
    };
    const response = await this.getClient().posts.submitPost(request);
    return response;
  }

  /* ======== Send Diamonds ==== */
  async sendDiamonds(
    ReceiverPublicKeyBase58Check,
    SenderPublicKeyBase58Check,
    DiamondPostHashHex,
    DiamondLevel
  ) {
    if (!ReceiverPublicKeyBase58Check) {
      console.log("No receiver");
      return;
    }
    if (!DiamondLevel) {
      console.log("No diamond amount selected");
      return;
    }
    try {
      const request = {
        ReceiverPublicKeyBase58Check: ReceiverPublicKeyBase58Check,
        SenderPublicKeyBase58Check: SenderPublicKeyBase58Check,
        DiamondPostHashHex: DiamondPostHashHex,
        DiamondLevel: DiamondLevel,
        MinFeeRateNanosPerKB: 2000,
      };
      const response = await this.getClient().social.sendDiamonds(request);
      return response;
    } catch (error) {
      console.log(error);
    }
  }
  /* ======= Get single profile picture ======= */
  async getSingleProfilePicture(user) {
    if (!user) {
      console.log("No user");
      return;
    }
    try {
      const response = await this.getClient().user.getSingleProfilePicture(
        user
      );
      if (response) {
        return response;
      } else {
        return "/images/profile.png";
      }
    } catch (error) {
      console.log(error);
      return "/images/profile.png";
    }
  }
  /* ===== Logs in the user ====== */
  async login() {
    const request = 3;
    const response = await this.getClient().identity.login(request);
    return response;
  }

  /* ======= Logs the user out ===== */

  async logout(user) {
    if (!user) {
      console.log("User is required");
      return;
    }
    try {
      const request = user;
      const response = await this.getClient().identity.logout(request);
      return response;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  /* ======= Like a Message ===== */
  async likeMessage(user, postHash, isUnlike) {
    if (!user) {
      console.log("User is required");
      return;
    }
    if (!postHash) {
      console.log("To like a message a post hash is required");
      return;
    }
    try {
      const request = {
        ReaderPublicKeyBase58Check: user,
        LikedPostHashHex: postHash,
        MinFeeRateNanosPerKB: 1000,
        IsUnlike: isUnlike,
      };
      const response = await this.getClient().social.createLikeStateless(
        request
      );
      return response;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  /* ==== Get User Notifications ===== */
  async getnotifications(user, NumToFetch, FetchStartIndex) {
    if (!user) {
      console.log("No user");
      return;
    }
    try {
      const request = {
        NumToFetch: NumToFetch,
        PublicKeyBase58Check: user,
        FetchStartIndex: FetchStartIndex,
        FilteredOutNotificationCategories: {},
      };
      const response = await this.getClient().notification.getNotifications(
        request
      );
      return response.data.Notifications;
    } catch (error) {
      console.log(error);
    }
  }

  /* ====== Get Notification Metadata ======*/
  async getUnreadNotifications(PublicKeyBase58Check) {
    if (!PublicKeyBase58Check) {
      console.log("User is required");
      return;
    }
    try {
      const request = {
        PublicKeyBase58Check: PublicKeyBase58Check,
      };
      const response =
        await this.getClient().notification.getUnreadNotificationsCount(
          request
        );
      return response.data;
    } catch (error) {
      console.log(error);
    }
  }

  /* ======= Follow User ======== */
  async followUser(Follower, Followed, IsUnfollow) {
    if (!Follower) {
      console.log("Follower not found");
      return;
    }
    if (!Followed) {
      console.log("Followed not found");
      return;
    }
    try {
      const request = {
        IsUnfollow: IsUnfollow,
        FollowedPublicKeyBase58Check: Followed,
        FollowerPublicKeyBase58Check: Follower,
      };

      const response = await this.getClient().social.createFollowTxnStateless(
        request
      );
    } catch (error) {
      console.log(error);
      return;
    }
  }

  /* ======= Check if the user if following ======= */
  async checkFollow(user, isFollowing) {
    if (!user) {
      console.log("User is needed");
      return;
    }
    if (!isFollowing) {
      console.log("Is following is needed");
      return;
    }
    try {
      const request = {
        PublicKeyBase58Check: user,
        IsFollowingPublicKeyBase58Check: isFollowing,
      };

      const response = await this.getClient().social.isFollowingPublicKey(
        request
      );
      return response;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  /* =============== Repost a post ============== */
  async rePost(user, PostHash) {
    if (!PostHash) {
      console.log("Parent hash needed");
      return;
    }
    try {
      const request = {
        UpdaterPublicKeyBase58Check: user,
        BodyObj: {},
        RepostedPostHashHex: PostHash,
      };
      const response = await this.getClient().posts.submitPost(request);
      console.log(response);
      return response;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  /* ====== The user has seen his notifications ======= */
  async sawNotifications(user, jwt, index) {
    if (!user) {
      console.log("User is needed");
      return;
    }
    try {
      const request = {
        PublicKeyBase58Check: user,
        UnreadNotifications: 0,
        LastUnreadNotificationIndex: index,
        LastSeenIndex: index,
        JWT: jwt,
      };

      const response =
        await this.getClient().notification.setNotificationMetadata(request);

      return response;
    } catch (error) {
      console.log(error);
      return;
    }
  }
  /* ============= Get Current Deso Value ============= */
  async getDeso(user) {
    if (!user) {
      console.log("User is needed");
      return;
    }
    try {
      const request = {
        PublicKeyBase58Check: user,
      };
      const response = await this.getClient().metaData.getExchangeRate(request);
      return response.USDCentsPerDeSoExchangeRate / 100;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  /* =========== Get Users Followers ============= */
  async getFollowers(user) {
    if (!user) {
      console.log("User is needed");
      return;
    }
    try {
      const request = {
        Username: user,
        GetEntriesFollowingUsername: true,
      };
      const response = await this.getClient().social.getFollowsStateless(
        request
      );
      return response;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  /* ========= Get Users Following =============== */

  async getFollowing(user) {
    if (!user) {
      console.log("User is needed");
      return;
    }
    try {
      const request = {
        Username: user,
        GetEntriesFollowingUsername: false,
      };
      const response = await this.getClient().social.getFollowsStateless(
        request
      );
      return response;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  /* ======== Get Following Feed ========== */
  async getFollowingFeed(user, post, NumToFetch) {
    if (!user) {
      console.log("User is needed");
      return;
    }
    try {
      const request = {
        PostHashHex: post,
        ReaderPublicKeyBase58Check: user,
        GetPostsForFollowFeed: true,
        NumToFetch: NumToFetch,
      };
      const response = await this.getClient().posts.getPostsStateless(request);
      //Reverse the order so that latest post is on the top
      const reverseArray = Object.entries(response).reverse();

      return response;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  /* ======= Get Feed Based on search ======== */

  async getSearchFeed(user, NumToFetch, topic) {
    if (!user) {
      console.log("User is needed");
      return;
    }

    try {
      const request = {
        ReaderPublicKeyBase58Check: user,
        ResponseLimit: NumToFetch,
        SortByNew: false,
        Tag: "@" + topic,
      };
      const response = await this.getClient().posts.getHotFeed(request);

      return response;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  /* ========== Get Circle Posts ========= */
  async getCirclePosts(user, NumToFetch, topic) {
    if (!user) {
      console.log("User is needed");
      return;
    }

    try {
      const request = {
        ReaderPublicKeyBase58Check: user,
        ResponseLimit: NumToFetch,
        SortByNew: true,
        Tag: "@" + topic,
      };

      const response = await this.getClient().posts.getHotFeed(request);

      return response;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  /* ========= Return PublicKey by Username ==== */

  async PublicKeyByUsername(user) {
    if (!user) {
      console.log("Username is needed");
      return;
    }
    try {
      const request = {
        Username: user,
      };
      const response = await this.getClient().user.getSingleProfile(request);
      return response.Profile.PublicKeyBase58Check;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  /* ===== Returns Username for Publickey ====== */
  async UsernameByPublickey(key) {
    if (!key) {
      console.log("Publickey is needed");
      return;
    }
    try {
      const request = {
        PublicKeyBase58Check: key,
      };
      const response = await this.getClient().user.getSingleProfile(request);
      return response.Profile.Username;
    } catch (error) {
      console.log(error);
      return;
    }
  }
  /* ========= Search Username ========== */
  async searchUsername(Prefix, NumToFetch, User) {
    if (!User) {
      console.log("User is required");
    }
    try {
      const request = {
        UsernamePrefix: Prefix,
        NumToFetch: NumToFetch,
        ReaderPublicKeyBase58Check: User,
        ModerationType: "leaderboard",
      };
      const response = await this.getClient().user.getProfiles(request);
      return response;
    } catch (error) {
      console.log(error);
      return;
    }
  }
  /* ========= Block Public User ========= */
  async blockPublicUser(user, blockedUser, jwt) {
    if (!user) {
      console.log("User is required to block public user");
      return;
    }
    if (!blockedUser) {
      console.log("Public key of blocked user is required");
      return;
    }
    try {
      const request = {
        PublicKeyBase58Check: user,
        JWT: jwt,
        BlockPublicKeyBase58Check: blockedUser,
      };
      const response = await this.getClient().user.blockPublicKey(request);
      return response;
    } catch (error) {
      console.log(error);
      return;
    }
  }
  /* ========= Login with Metamask ======= */
  async logWithMetamask() {
    const request = {
      network: "mainnet",
    };
    try {
      const response =
        await this.getClient().metaData.getPublicKeyFromSignature(request);
      return response;
    } catch (error) {
      console.log(error);
    }
  }
  /* ======== Delete a user's personal info ===== */
  async deleteInfo(user, JWT) {
    if (!user) {
      console.log("User is needed");
      return;
    }
    if (!JWT) {
      console.log("JWT is needed");
      return;
    }
    try {
      const request = {
        PublicKeyBase58Check: user,
        JWT: JWT,
      };
      const response = await this.getClient().user.deletePii(request);
      return response;
    } catch (error) {
      console.log(error);
    }
  }

  async updateInfo(key, username, bio, fr, pic, banner) {
    if (!key) {
      console.log("Key is required");
      return;
    }
    if (!username) {
      alert("Username cannot be empty");
      return;
    }

    try {
      const request = {
        ProfilePublicKeyBase58Check: "",
        UpdaterPublicKeyBase58Check: key,
        NewUsername: username,
        NewDescription: bio,
        NewCreatorBasisPoints: fr,
        MinFeeRateNanosPerKB: 1000,
        NewStakeMultipleBasisPoints: 12500,
        NewProfilePic: pic,
        ExtraData: {
          FeaturedImageURL: banner,
        },
      };

      const response = await this.getClient().social.updateProfile(request);
      return response;
    } catch (error) {
      return error;
    }
  }

  /* ============ Nft Api's ================= */

  async createNft(
    key,
    postHash,
    copies,
    royaltyCreator,
    royaltyCoin,
    HasUnlockable,
    forSale,
    price,
    rate
  ) {
    if (!key) {
      console.log("User key is required");
      return;
    }
    if (!postHash) {
      console.log("Post hash is required");
      return;
    }
    try {
      const request = {
        UpdaterPublicKeyBase58Check: key,
        NFTPostHashHex: postHash,
        NumCopies: copies,
        NFTRoyaltyToCreatorBasisPoints: royaltyCreator,
        NFTRoyaltyToCoinBasisPoints: royaltyCoin,
        HasUnlockable: HasUnlockable,
        IsForSale: forSale,
        MinBidAmountNanos: price * 1000000000,
        MinFeeRateNanosPerKB: rate,
      };
      const response = await this.getClient().nft.createNft(request);
      return response;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  /* ======== Get current user's JWT ========== */
  async getJwt(user) {
    if (!user) {
      console.log("User needed");
      return;
    }
    try {
      const request = user;
      const response = await this.getClient().identity.getJwt(request);
      return response;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  /* ======== Get Client ======= */
  getClient() {
    if (this.client) return this.client;
    this.client = new Deso();
    return this.client;
  }
}
export default DesoApi;
