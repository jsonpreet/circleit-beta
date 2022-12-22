export function parseNotification(notification, reader,profiles, posts) {

    const txnMeta = notification.Metadata;
    const userPublicKeyBase58Check = reader;

    if (txnMeta == null) {
        return null;
    }

    // The transactor is usually needed so parse her out and try to convert her
    // to a username.
    const actor = profiles[txnMeta.TransactorPublicKeyBase58Check] || {
        Username: 'anonymous',
        ProfilePic: '/assets/img/default_profile_pic.png',
    };
    const userProfile = profiles[userPublicKeyBase58Check];
    const actorName = actor.IsVerified
        ? `<b>${actor.Username}</b><span class="ml-1 d-inline-block align-center text-primary fs-12px"><i class="fas fa-check-circle fa-md align-middle"></i></span>`
        : `<b>${actor.Username}</b>`;

    // We map everything to an easy-to-use object so the template
    // doesn't have to do any hard work
    const result = {
        actor, // who created the notification
        type: null,
        category: null, // category used for filtering
        post: null, // the post involved
        parentPost: null, // the parent post involved
        link: actor.Username,
        bidInfo: null,
        comment: null, // the text of the comment
        nftEntryResponses: null, // NFT Entry Responses, for transfers
    };

    if (txnMeta.TxnType === 'BASIC_TRANSFER') {
        const basicTransferMeta = txnMeta.BasicTransferTxindexMetadata;
        if (!basicTransferMeta) {
            return null;
        }
        if (basicTransferMeta.DiamondLevel) {
            result.type = 'DIAMOND_SENT';
            result.action = `<b>${basicTransferMeta.DiamondLevel.toString()} diamond${
                basicTransferMeta.DiamondLevel > 1 ? 's' : ''
            }</b> (~${basicTransferMeta.DiamondLevel})`;
            
            const post = posts[basicTransferMeta.PostHashHex];
            result.post = post;
            result.parentPost = post.ParentStakeID;
        } else {
            let txnAmountNanos = 0;
            for (let ii = 0; ii < notification.TxnOutputResponses.length; ii++) {
                if ( notification.TxnOutputResponses[ii].PublicKeyBase58Check === userPublicKeyBase58Check ) {
                    txnAmountNanos += notification.TxnOutputResponses[ii].AmountNanos;
                }
            }
            result.type = 'MONEY_SENT';
            result.action =
                `sent you ${txnAmountNanos} ` +
                `$DESO!</b> (~${txnAmountNanos})`;
        }
        return result;
    } else if (txnMeta.TxnType === 'CREATOR_COIN') {
        // If we don't have the corresponding metadata then return null.
        const ccMeta = txnMeta.CreatorCoinTxindexMetadata;
        if (!ccMeta) {
            return null;
        }

        result.type = 'COIN_BOUGHT_SOLD';

        if (ccMeta.OperationType === 'buy') {
            result.action = `${actorName} bought <b>~${ccMeta.DeSoToSellNanos}</b> worth of <b>$${userProfile.Username}</b>!`;
            return result;
        } else if (ccMeta.OperationType === 'sell') {
            // TODO: We cannot compute the USD value of the sale without saving the amount of DeSo
            // that was used to complete the transaction in the backend, which we are too lazy to do.
            // So for now we just tell the user the amount of their coin that was sold.
            result.action = `${actorName} sold <b>${ccMeta.CreatorCoinToSellNanos} $${userProfile.Username}.</b>`;
            return result;
        }
    } else if (txnMeta.TxnType === 'CREATOR_COIN_TRANSFER') {
        const cctMeta = txnMeta.CreatorCoinTransferTxindexMetadata;
        if (!cctMeta) {
            return null;
        }

        if (cctMeta.DiamondLevel) {
        result.type = 'DIAMOND_SENT';
        let postText = '';
        if (cctMeta.PostHashHex) {
            const post = posts[cctMeta.PostHashHex];
            postText = `<i className="text-grey7 truncate">${post.Body}</i>`;
            result.link = cctMeta.PostHashHex;
        }
        result.action = `${actorName} gave <b>${cctMeta.DiamondLevel.toString()} diamond${
            cctMeta.DiamondLevel > 1 ? 's' : ''
        }</b> (~${cctMeta.DiamondLevel}) ${postText}`;
        } else {
            result.type = 'COINS_SENT';
            result.action = `${actorName} sent you <b>${cctMeta.CreatorCoinToTransferNanos} ${cctMeta.CreatorUsername} coins`;
        }

        return result;
    } else if (txnMeta.TxnType === 'SUBMIT_POST') {
        const spMeta = txnMeta.SubmitPostTxindexMetadata;
        if (!spMeta) {
            return null;
        }

        // Grab the hash of the post that created this notification.
        const postHash = spMeta.PostHashBeingModifiedHex;

        // Go through the affected public keys until we find ours. Then
        // return a notification based on the Metadata.
        for (const currentPkObj of txnMeta.AffectedPublicKeys) {
            if (currentPkObj.PublicKeyBase58Check !== userPublicKeyBase58Check) {
                continue;
            }

            // In this case, we are dealing with a reply to a post we made.
            if (currentPkObj.Metadata === 'ParentPosterPublicKeyBase58Check') {
                result.post = posts[postHash];
                result.parentPost = posts[spMeta.ParentPostHashHex];
                if (result.post === null || result.parentPost === null) {
                    return;
                }
                result.type = 'REPLIED_TO_POST';

                return result;
            } else if (currentPkObj.Metadata === 'MentionedPublicKeyBase58Check') {
                result.post = posts[postHash];
                if (result.post === null) {
                    return;
                }
                
                result.type = 'MENTIONED';

                return result;
            } else if (currentPkObj.Metadata === 'RepostedPublicKeyBase58Check') {
                result.post = posts[postHash];
                result.type = 'REPOSTED';
                if (result.post === null) {
                    return;
                }
                return result;
            }
        }
    } else if (txnMeta.TxnType === 'FOLLOW') {
        const followMeta = txnMeta.FollowTxindexMetadata;
        if (!followMeta) {
            return null;
        }

        if (followMeta.IsUnfollow) {
            result.type = 'UNFOLLOWED';
            result.action = `${actorName} unfollowed you`;
        } else {
            result.type = 'FOLLOWED';
            result.action = `${actorName} followed you`;
        }

        return result;
    } else if (txnMeta.TxnType === 'LIKE') {
        const likeMeta = txnMeta.LikeTxindexMetadata;
        if (!likeMeta) {
            return null;
        }

        const postHash = likeMeta.PostHashHex;
        const post = posts[postHash];
        const postText = post.Body;
        if (!postText) {
            return null;
        }
        result.post = post;
        result.type = 'LIKED';
        result.action = `<i className="text-grey7 truncate">${postText}</i>`;
        result.link = postHash;

        return result;
    } else if (txnMeta.TxnType === 'NFT_BID') {
        // const nftBidMeta = txnMeta.NFTBidTxindexMetadata;
        // if (!nftBidMeta) {
        //     return null;
        // }

        // const postHash = nftBidMeta.NFTPostHashHex;
        // const actorName =
        // actor.Username !== 'anonymous'
        //     ? actor.Username
        //     : txnMeta.TransactorPublicKeyBase58Check;
        // result.bidInfo = {
        // SerialNumber: nftBidMeta.SerialNumber,
        // BidAmountNanos: nftBidMeta.BidAmountNanos,
        // };
        // result.post = posts[postHash];
        // if (
        // nftBidMeta.IsBuyNowBid &&
        // userPublicKeyBase58Check ===
        //     nftBidMeta.OwnerPublicKeyBase58Check
        // ) {
        //     result.action = `${actorName} bought serial number ${
        //         nftBidMeta.SerialNumber
        //     } for ${nftBidMeta.BidAmountNanos} DESO (~${nftBidMeta.BidAmountNanos})`;
        //     result.icon = 'fas fa-cash-register fc-green';
        //     return result;
        // } else if (
        // userPublicKeyBase58Check ===
        // nftBidMeta.OwnerPublicKeyBase58Check
        // ) {
        // result.action = nftBidMeta.BidAmountNanos
        //     ? `${actorName} bid ${this.globalVars.nanosToDeSo(
        //         nftBidMeta.BidAmountNanos,
        //         2
        //     )} DESO (~${this.globalVars.nanosToUSD(
        //         nftBidMeta.BidAmountNanos,
        //         2
        //     )}) for serial number ${nftBidMeta.SerialNumber}`
        //     : `${actorName} cancelled their bid on serial number ${nftBidMeta.SerialNumber}`;
        // result.type = 'NFT_BID';
        // return result;
        // } else if (
        // userPublicKeyBase58Check ===
        //     nftBidMeta.CreatorPublicKeyBase58Check &&
        // nftBidMeta.IsBuyNowBid
        // ) {
        // const royaltyString = this.getRoyaltyString(
        //     nftBidMeta.CreatorCoinRoyaltyNanos,
        //     nftBidMeta.CreatorRoyaltyNanos,
        //     false
        // );
        // if (!royaltyString) {
        //     return null;
        // }
        // result.action = `${actor.Username} bought an NFT you created that generated ${royaltyString}`;
        // return result;
        // } else {
        // const additionalCoinRoyaltiesMap =
        //     nftBidMeta.AdditionalCoinRoyaltiesMap || {};
        // const additionalDESORoyaltiesMap =
        //     nftBidMeta.AdditionalDESORoyaltiesMap || {};
        // if (
        //     userPublicKeyBase58Check in
        //     additionalCoinRoyaltiesMap ||
        //     userPublicKeyBase58Check in
        //     additionalDESORoyaltiesMap
        // ) {
        //     const additionalCoinRoyalty =
        //     additionalCoinRoyaltiesMap[
        //         userPublicKeyBase58Check
        //     ];
        //     const additionalDESORoyalty =
        //     additionalDESORoyaltiesMap[
        //         userPublicKeyBase58Check
        //     ];
        //     const royaltyString = this.getRoyaltyString(
        //     additionalCoinRoyalty,
        //     additionalDESORoyalty,
        //     false
        //     );
        //     if (!royaltyString) {
        //     return null;
        //     }
        //     result.action = `${actor.Username} bought an NFT that generated ${royaltyString}`;
        //     result.icon = 'fas fa-hand-holding-usd fc-green';
        //     return result;
        // } else {
        //     return null;
        // }
        // }
    } else if (txnMeta.TxnType === 'ACCEPT_NFT_BID') {
        // const acceptNFTBidMeta = txnMeta.AcceptNFTBidTxindexMetadata;
        // if (!acceptNFTBidMeta) {
        // return null;
        // }

        // const postHash = acceptNFTBidMeta.NFTPostHashHex;

        // result.post = posts[postHash];
        // const additionalCoinRoyaltiesMap =
        // acceptNFTBidMeta.AdditionalCoinRoyaltiesMap || {};
        // const additionalDESORoyaltiesMap =
        // acceptNFTBidMeta.AdditionalDESORoyaltiesMap || {};
        // if (
        // userPublicKeyBase58Check in
        //     additionalCoinRoyaltiesMap ||
        // userPublicKeyBase58Check in
        //     additionalDESORoyaltiesMap
        // ) {
        // const additionalCoinRoyalty =
        //     additionalCoinRoyaltiesMap[
        //     userPublicKeyBase58Check
        //     ];
        // const additionalDESORoyalty =
        //     additionalDESORoyaltiesMap[
        //     userPublicKeyBase58Check
        //     ];
        // const royaltyString = this.getRoyaltyString(
        //     additionalCoinRoyalty,
        //     additionalDESORoyalty,
        //     false
        // );
        // result.action = `${actor.Username} accepted a bid on an NFT you created that generated ${royaltyString}`;
        // result.icon = 'fas fa-hand-holding-usd fc-green';
        // return result;
        // } else if (
        // userPublicKeyBase58Check ===
        // acceptNFTBidMeta.CreatorPublicKeyBase58Check
        // ) {
        // const royaltyString = this.getRoyaltyString(
        //     acceptNFTBidMeta.CreatorCoinRoyaltyNanos,
        //     acceptNFTBidMeta.CreatorRoyaltyNanos,
        //     false
        // );
        // if (!royaltyString) {
        //     return null;
        // }
        // result.action = `${actor.Username} accept a bid on an NFT you created that generated ${royaltyString}`;
        // return result;
        // } else {
        // result.action = `${
        //     actor.Username
        // } accepted your bid of ${this.globalVars.nanosToDeSo(
        //     acceptNFTBidMeta.BidAmountNanos,
        //     2
        // )} for serial number ${acceptNFTBidMeta.SerialNumber}`;
        // result.icon = 'fas fa-trophy fc-gold';
        // result.bidInfo = {
        //     SerialNumber: acceptNFTBidMeta.SerialNumber,
        //     BidAmountNanos: acceptNFTBidMeta.BidAmountNanos,
        // };
        // return result;
        // }
    } else if (txnMeta.TxnType === 'NFT_TRANSFER') {
    //     const nftTransferMeta = txnMeta.NFTTransferTxindexMetadata;
    //     if (!nftTransferMeta) {
    //     return null;
    //     }

    //     const postHash = nftTransferMeta.NFTPostHashHex;

    //     const actorName =
    //     actor.Username !== 'anonymous'
    //         ? actor.Username
    //         : txnMeta.TransactorPublicKeyBase58Check;
    //     result.post = posts[postHash];
    //     result.action = `${actorName} transferred you an NFT`;
    //     result.icon = 'fas fa-paper-plane fc-blue';
    //     return result;
    // } else if (txnMeta.TxnType === 'CREATE_NFT') {
    //     const createNFTMeta = txnMeta.CreateNFTTxindexMetadata;
    //     if (!createNFTMeta) {
    //     return null;
    //     }
    //     createNFTMeta.AdditionalDESORoyaltiesMap =
    //     createNFTMeta.AdditionalDESORoyaltiesMap || {};
    //     createNFTMeta.AdditionalCoinRoyaltiesMap =
    //     createNFTMeta.AdditionalCoinRoyaltiesMap || {};
    //     const additionalCoinRoyalty =
    //     createNFTMeta.AdditionalCoinRoyaltiesMap[
    //         userPublicKeyBase58Check
    //     ];
    //     const additionalDESORoyalty =
    //     createNFTMeta.AdditionalDESORoyaltiesMap[
    //         userPublicKeyBase58Check
    //     ];
    //     const royaltyString = this.getRoyaltyString(
    //     additionalCoinRoyalty,
    //     additionalDESORoyalty,
    //     true
    //     );
    //     if (!royaltyString) {
    //     return null;
    //     }
    //     result.action = `${actorName} minted an NFT and gave ${royaltyString}`;
    //     result.icon = 'fas fa-percentage fc-green';
    //     result.post = posts[createNFTMeta.NFTPostHashHex];
    //     return result;
    } else if (txnMeta.TxnType === 'UPDATE_NFT') {
        // const updateNFTMeta = txnMeta.UpdateNFTTxindexMetadata;
        // if (!updateNFTMeta || !updateNFTMeta.IsForSale) {
        // return null;
        // }
        // result.post = posts[updateNFTMeta.NFTPostHashHex];
        // result.icon = 'fas fa-tags fc-green';
        // if (
        // result.post.PosterPublicKeyBase58Check ===
        // userPublicKeyBase58Check
        // ) {
        // result.action = `${actorName} put your NFT on sale`;
        // return result;
        // } else {
        // const additionalDESORoyaltiesMap =
        //     result.post.AdditionalDESORoyaltiesMap || {};
        // const additionalCoinRoyaltiesMap =
        //     result.post.AdditionalCoinRoyaltiesMap || {};
        // const additionalCoinRoyalty =
        //     additionalCoinRoyaltiesMap[
        //     userPublicKeyBase58Check
        //     ];
        // const additionalDESORoyalty =
        //     additionalDESORoyaltiesMap[
        //     userPublicKeyBase58Check
        //     ];
        // const royaltyString = this.getRoyaltyString(
        //     additionalCoinRoyalty,
        //     additionalDESORoyalty,
        //     true
        // );
        // if (!royaltyString) {
        //     return null;
        // }
        // result.action = `${actorName} put an NFT on sale - you receive ${royaltyString} on the sale`;
        // return result;
        // }
    } else if (txnMeta.TxnType === 'DAO_COIN') {
        // const daoCoinMeta = txnMeta.DAOCoinTxindexMetadata;
        // if (!daoCoinMeta) {
        // return null;
        // }
        // switch (daoCoinMeta.OperationType) {
        // case 'mint': {
        //     result.action = `minted ${this.globalVars.hexNanosToUnitString(
        //     daoCoinMeta.CoinsToMintNanos
        //     )} ${daoCoinMeta.CreatorUsername} DAO coin`;
        //     result.icon = 'fas fa-coins fc-green';
        //     return result;
        // }
        // case 'burn': {
        //     result.action = `${actorName} burned ${this.globalVars.hexNanosToUnitString(
        //     daoCoinMeta.CoinsToBurnNanos
        //     )} ${daoCoinMeta.CreatorUsername} DAO coin`;
        //     result.icon = 'fa fa-fire fc-red';
        //     return result;
        // }
        // case 'disable_minting': {
        //     result.action = `${actorName} disabled minting for ${daoCoinMeta.CreatorUsername} DAO coin`;
        //     result.icon = 'fas fa-minus-circle fc-red';
        //     return result;
        // }
        // case 'update_transfer_restriction_status': {
        //     result.action = `${actorName} updated the transfer restriction status of ${daoCoinMeta.CreatorUsername} DAO coin to ${daoCoinMeta.TransferRestrictionStatus}`;
        //     result.icon = 'fas fa-pen-fancy';
        //     return result;
        // }
        // }
        // return null;
    } else if (txnMeta.TxnType === 'DAO_COIN_TRANSFER') {
        // const daoCoinTransferMeta = txnMeta.DAOCoinTransferTxindexMetadata;
        // if (!daoCoinTransferMeta) {
        // return null;
        // }
        // result.icon = 'fas fa-money-bill-wave fc-blue';
        // result.action = `${actorName} sent you <b>${this.globalVars.hexNanosToUnitString(
        // daoCoinTransferMeta.DAOCoinToTransferNanos,
        // 6
        // )} ${daoCoinTransferMeta.CreatorUsername} coin`;
        // return result;
    }
    // If we don't recognize the transaction type we return null
    return null;
}