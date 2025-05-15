import { TagApi } from '@/models';
import { FlatList, StyleSheet } from 'react-native';
import { Chip, useTheme } from 'react-native-paper';
import Container from '@/app/components/Container';

export type TagListProps = {
  tags: TagApi[];
};

export default function TagList(props: TagListProps) {
  const theme = useTheme();
  return (
    <Container
      style={{
        borderRadius: theme.roundness,
        paddingBottom: 5,
      }}>
      <FlatList
        numColumns={3}
        columnWrapperStyle={{ marginBottom: 6 }}
        data={props.tags}
        renderItem={({ item }) => (
          <Chip style={styles.tag} icon={'tag'} testID={item.title}>
            {item.title}
          </Chip>
        )}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  tag: {
    marginLeft: 10,
  },
});
