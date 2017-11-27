import { Effect, Actions } from '@ngrx/effects';
import { Action } from '@ngrx/store';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';

import * as actions from './actions';
import * as actionTypes from './action-types';
import { Post } from './model';
import { BlogService } from './service';
import { InfoResponse, PostsResponse } from '../tumblr';

@Injectable()
export class BlogEffects {
  constructor(
    private actions$: Actions,
    private blogService: BlogService
  ) {}

  // Log all actions.
  @Effect({dispatch: false})
  logAllActions$ = this.actions$
  .pipe(
    tap<Action>((action) => {
      console.debug(`Action: ${action.type}`, action['payload']);
    })
  )

  @Effect()
  fetchInfo$ = this.actions$
  .ofType(actionTypes.FETCH_INFO)
  .pipe(
    mergeMap((action: actions.FetchInfo) => {
      const apiKey = action.payload.apiKey;
      const blogName = action.payload.blogName;
      return this.blogService.fetchInfo(blogName, apiKey)
      .pipe(
        map<InfoResponse, actions.FetchInfoSuccess>((infoResponse) => {
          const blog = infoResponse.response.blog;
          return new actions.FetchInfoSuccess({
            blogName: blog.name,
            blogSize: blog.posts
          });
        }),
        catchError<any, actions.FetchInfoFail>((error) => Observable.of(new actions.FetchInfoFail({blogName, apiKey, error})))
      )
    })
  )

  @Effect()
  fetchPosts$ = this.actions$
  .ofType(actionTypes.FETCH_POSTS)
  .pipe(
    mergeMap((action: actions.FetchPosts) => {
      const apiKey = action.payload.apiKey;
      const blogName = action.payload.blogName;
      const start = action.payload.start;
      const end = action.payload.end;
      const type = action.payload.type;
      return this.blogService.fetchPosts(blogName, apiKey, start, end, type)
      .pipe(
        map<Post[], actions.FetchPostsSuccess>((posts) => new actions.FetchPostsSuccess({posts})),
        catchError<any, actions.FetchPostsFail>((error) => Observable.of(new actions.FetchPostsFail({blogName, apiKey, error})))
      )
    })
  )
}
