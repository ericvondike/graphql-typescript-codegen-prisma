import { GraphQLResolveInfo } from 'graphql';
import grphqlFileds from 'graphql-fields';

export const interceptQueries = (info: GraphQLResolveInfo) => {
  // info.fieldNodes

  console.log(Object.keys(grphqlFileds(info, {}, { processArguments: true })));
  // info.fieldNodes.forEach(field => {
  //   // console.log(field)
  //   field.selectionSet?.selections.forEach(selection => {
  //     console.log('Selection Start------------------------');
  //     console.log(selection)
  //     console.log('Selection End------------------------\n');
  //   })
    
    
  //   console.log(JSON.stringify(field.selectionSet))
  // })
}